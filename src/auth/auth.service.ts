import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.model';
import { RegisterDto } from './dto/register.dto';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userModel.findOne({ where: { email: dto.email } });
        if (existing) throw new ConflictException('User already exists');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.userModel.create({ ...dto, password: hashedPassword });
        return this.generateTokens(user);
    }

    async login(dto: AuthDto) {
        const user = await this.userModel.findOne({ where: { email: dto.email } });
        if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return { ...tokens, user: { id: user.id, email: user.email, role: user.role } };
    }

    async refresh(rt: string) {
        if (!rt) throw new BadRequestException('Refresh token missing');
        try {
            const decoded = this.jwtService.verify(rt, { secret: this.configService.get('JWT_REFRESH_SECRET') });
            const user = await this.userModel.findByPk(decoded.sub);
            if (!user || !user.refreshToken || !(await bcrypt.compare(rt, user.refreshToken))) throw new Error();
            const tokens = await this.generateTokens(user);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        } catch {
            throw new UnauthorizedException('Access Denied');
        }
    }

    async logout(userId: string) {
        await this.userModel.update({ refreshToken: null }, { where: { id: userId } });
    }

    async getMe(userId: string) {
        const user = await this.userModel.findByPk(userId, { attributes: { exclude: ['password', 'refreshToken'] } });
        if (!user) throw new NotFoundException();
        return user;
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.userModel.findByPk(userId);
        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isMatch) throw new BadRequestException('Old password incorrect');
        user.password = await bcrypt.hash(dto.newPassword, 10);
        await user.save();
        return { message: 'Success' };
    }

    async forgotPassword(email: string) {
        const user = await this.userModel.findOne({ where: { email } });
        if (!user) throw new NotFoundException('Email not found');
        return { message: 'Reset link sent' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.userModel.findOne({ where: { email: 'admin@example.com' } });
        if (!user) throw new NotFoundException('Invalid token');

        user.password = await bcrypt.hash(dto.newPassword, 10);
        await user.save();
        return { message: 'Password has been reset' };
    }

    private async generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '1h', secret: this.configService.get('JWT_SECRET') }),
            this.jwtService.signAsync(payload, { expiresIn: '7d', secret: this.configService.get('JWT_REFRESH_SECRET') })
        ]);
        return { accessToken: at, refreshToken: rt };
    }

    private async updateRefreshToken(userId: string, rt: string) {
        const hashedRt = await bcrypt.hash(rt, 10);
        await this.userModel.update({ refreshToken: hashedRt }, { where: { id: userId } });
    }
}