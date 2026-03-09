import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.model';
import { Driver } from '../drivers/driver.model';
import { UsersService } from '../users/users.service';
import { DriversService } from '../drivers/drivers.service';
import { Role } from '../common/enums/role.enum';
import { IAuthEntity } from './interfaces/auth-entity.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private readonly userModel: typeof User,
        @InjectModel(Driver) private readonly driverModel: typeof Driver,
        private readonly usersService: UsersService,
        private readonly driversService: DriversService,
        private readonly jwtService: JwtService,
        private readonly sequelize: Sequelize,
    ) { }

    async validateUser(email: string, pass: string): Promise<IAuthEntity | null> {
        const entity = await this.userModel.findOne({ where: { email } }) || 
                       await this.driverModel.findOne({ where: { email } });

        if (entity && (await bcrypt.compare(pass, (entity as any).password))) {
            return entity as unknown as IAuthEntity;
        }
        return null;
    }

    async login(entity: IAuthEntity) {
        const role = entity.role || Role.DRIVER;
        const tokens = await this.generateTokens(entity.id, entity.email, role);
        await this.updateRefreshToken(entity.id, role, tokens.refresh_token);

        const plainEntity = (entity as any).get ? (entity as any).get({ plain: true }) : entity;
        const { password, refreshToken, ...userProfile } = plainEntity;

        return { ...tokens, user: { ...userProfile, role } };
    }

    async register(dto: any, isDriver: boolean) {
        return await this.sequelize.transaction(async (t) => {
            const entity = isDriver 
                ? await this.driversService.create(dto) 
                : await this.usersService.create(dto);

            if (!entity) throw new BadRequestException('Registration failed');
            return await this.login(entity as unknown as IAuthEntity);
        });
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const entity = await this.getEntityById(payload.sub, payload.role);

            if (!entity?.refreshToken || !(await bcrypt.compare(refreshToken, entity.refreshToken))) {
                throw new UnauthorizedException();
            }

            const tokens = await this.generateTokens(entity.id, entity.email, payload.role);
            await this.updateRefreshToken(entity.id, payload.role, tokens.refresh_token);
            return tokens;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    async logout(userId: string, role: string) {
        const model = role === Role.DRIVER ? this.driverModel : this.userModel;
        await (model as any).update({ refreshToken: null }, { where: { id: userId } });
        return { message: 'Logged out successfully' };
    }

    private async getEntityById(id: string, role: string): Promise<IAuthEntity | null> {
        const model = role === Role.DRIVER ? this.driverModel : this.userModel;
        const entity = await (model as any).findByPk(id);
        return entity as unknown as IAuthEntity;
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload: JwtPayload = { sub: userId, email, role: role as Role };
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '1d' }),
            this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        ]);
        return { access_token: at, refresh_token: rt };
    }

    private async updateRefreshToken(userId: string, role: string, refreshToken: string) {
        const model = role === Role.DRIVER ? this.driverModel : this.userModel;
        const hashed = await bcrypt.hash(refreshToken, 10);
        await (model as any).update({ refreshToken: hashed }, { where: { id: userId } });
    }
}