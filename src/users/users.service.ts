import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) { }

  async create(dto: CreateUserDto) {
    const existing = await this.userModel.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('User already exists');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({ ...dto, password: hashedPassword });
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, role, search } = query;
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    return this.userModel.findAndCountAll({
      where,
      limit: +limit,
      offset: (+page - 1) * +limit,
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [['createdAt', 'DESC']]
    });
  }

  async findOne(id: string) {
    const user = await this.userModel.findByPk(id, { attributes: { exclude: ['password', 'refreshToken'] } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    return user.update(dto);
  }

  async remove(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    await user.destroy();
    return { success: true };
  }

  async toggleStatus(id: string, isActive: boolean) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    return user.update({ isActive });
  }
}