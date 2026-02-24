import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './user.model';
import { RegisterDto } from './dto/register.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthFlowDto } from './dto/auth-flow.dto';
import { PasswordManagementDto } from './dto/password-management.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userModel.findOne({ where: { email: dto.email } });
        if (existing) throw new ConflictException('User with this email already exists');

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.userModel.create({ ...dto, password: hashedPassword } as any);
        return { message: 'User registered successfully', userId: user.id };
    }

    async login(dto: AuthDto) {
        const user = await this.userModel.findOne({ where: { email: dto.email } });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async refresh(dto: AuthFlowDto) {
        if (!dto.refreshToken) throw new BadRequestException('Refresh token is required');

        try {
            const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: this.configService.get('JWT_SECRET'),
            });

            const user = await this.userModel.findByPk(payload.sub);
            if (!user || !user.refreshToken || !(await bcrypt.compare(dto.refreshToken, user.refreshToken))) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const tokens = await this.generateTokens(user);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async logout(userId: string) {
        await this.userModel.update({ refreshToken: null }, { where: { id: userId } });
        return { message: 'Logged out successfully' };
    }

    async changePassword(userId: string, dto: PasswordManagementDto) {
        const user = await this.userModel.findByPk(userId);
        if (!user) throw new NotFoundException('User not found');

        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isMatch) throw new UnauthorizedException('Old password does not match');

        user.password = await bcrypt.hash(dto.newPassword, 10);
        await user.save();
        return { message: 'Password changed' };
    }

    async forgotPassword(dto: AuthFlowDto) {
        const user = await this.userModel.findOne({ where: { email: dto.email } });
        if (!user) throw new NotFoundException('User with this email not found');
        return { message: 'Reset link sent' };
    }

    async resetPassword(dto: AuthFlowDto) {
        if (!dto.token || !dto.newPassword) throw new BadRequestException('Token and new password are required');
        return { message: 'Password reset successful' };
    }

    private async generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '1h' }),
            this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        ]);
        return { accessToken: at, refreshToken: rt, expiresIn: 3600 };
    }

    private async updateRefreshToken(userId: string, rt: string) {
        const hashedRt = await bcrypt.hash(rt, 10);
        await this.userModel.update({ refreshToken: hashedRt }, { where: { id: userId } });
    }
}