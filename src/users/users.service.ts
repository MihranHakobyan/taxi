import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly configService: ConfigService) { }

  async create(dto: CreateUserDto): Promise<User> {

    const existingUser = await this.userModel.findOne({ where: { email: dto.email } });



    if (existingUser) throw new ConflictException('User with this email already exists');

    try {
      const serverSalt = this.configService.get<string>('PASSWORD_SALT');
      const passwordToHash = dto.password + serverSalt;
      const hashedPassword = await bcrypt.hash(passwordToHash, 10);

      const user = await this.userModel.create({ ...dto, password: hashedPassword });

      const userRaw = user.get({ plain: true });
      delete userRaw.password;
      delete userRaw.refreshToken;

      return userRaw as User;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));

    const where: any = {};
    if (query.search) {
      const searchPath = { [Op.iLike]: `%${query.search}%` };
      where[Op.or] = [
        { firstName: searchPath },
        { lastName: searchPath },
        { email: searchPath },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const { count, rows } = await this.userModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      meta: {
        totalItems: count,
        itemCount: rows.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({
      where: {
        email: email.trim().toLowerCase()
      },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userModel.findOne({
        where: { email: dto.email, id: { [Op.ne]: id } }
      });
      if (emailExists) throw new ConflictException('Email already in use');
    }

    if (dto.password) {
      const serverSalt = this.configService.get<string>('PASSWORD_SALT');
      const passwordToHash = dto.password + serverSalt;
      dto.password = await bcrypt.hash(passwordToHash, 10);
    }

    await user.update(dto);
    return this.findOne(id);
  }

  async setStatus(id: string, isActive: boolean) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');

    await user.update({ isActive });
    return {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  }

  async remove(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    await this.setStatus(id, false);
    await user.destroy();
    return { success: true, message: 'User deleted successfully' };
  }

  async createPasswordResetToken(email: string): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const salt = this.configService.get<string>('TOKEN_SALT') || '';
    const hashedToken = crypto.createHash('sha256').update(token + salt).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    await user.save();

    const cleanUser = user.get({ plain: true });
    delete cleanUser.password;
    delete cleanUser.refreshToken;

    return { user: cleanUser, token };
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const salt = this.configService.get<string>('TOKEN_SALT') || '';
    const hashedToken = crypto.createHash('sha256').update(token + salt).digest('hex');

    const user = await this.userModel.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    
    const serverSalt = this.configService.get<string>('PASSWORD_SALT');
    const passwordToHash = newPassword + serverSalt;
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return true;
  }

}