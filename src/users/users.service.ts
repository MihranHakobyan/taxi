import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { log } from 'console';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) { }

  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('User with this email already exists');

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

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
      dto.password = await bcrypt.hash(dto.password, 10);
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
}