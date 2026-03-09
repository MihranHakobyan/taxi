import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Driver, DriverStatus } from './driver.model';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class DriversService {
  constructor(
    @InjectModel(Driver) private readonly driverModel: typeof Driver,
    private readonly sequelize: Sequelize,
  ) { }

  async create(dto: CreateDriverDto) {
    const existing = await this.driverModel.findOne({
      where: {
        [Op.or]: [
          { email: dto.email },
          { phone: dto.phone },
          { licenseNumber: dto.licenseNumber }
        ]
      },
      attributes: ['id', 'email', 'phone']
    });

    if (existing) {
      const field = existing.email === dto.email ? 'Email' :
        existing.phone === dto.phone ? 'Phone' : 'License number';
      throw new ConflictException(`${field} already in use`);
    }

    return await this.sequelize.transaction(async (transaction) => {
      try {
        const driver = await this.driverModel.create(dto as any, { transaction });
        const { password, refreshToken, ...result } = driver.get({ plain: true });
        return result;
      } catch (error) {
        throw new InternalServerErrorException('Database operation failed');
      }
    });
  }

  async findAll(query: { page?: number; limit?: number; status?: DriverStatus; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));

    const where: any = {};
    if (query.status) where.status = query.status;

    if (query.search) {
      const searchStr = `%${query.search}%`;
      where[Op.or] = [
        { firstName: { [Op.iLike]: searchStr } },
        { lastName: { [Op.iLike]: searchStr } },
        { phone: { [Op.iLike]: searchStr } },
        { licenseNumber: { [Op.iLike]: searchStr } }
      ];
    }

    const { rows, count } = await this.driverModel.findAndCountAll({
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
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.driverModel.findByPk(id, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto) {
    const driver = await this.driverModel.findByPk(id);
    if (!driver) throw new NotFoundException('Driver not found');

    if (dto.email || dto.phone || dto.licenseNumber) {
      const conflict = await this.driverModel.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            dto.email ? { email: dto.email } : null,
            dto.phone ? { phone: dto.phone } : null,
            dto.licenseNumber ? { licenseNumber: dto.licenseNumber } : null
          ].filter(Boolean)
        }
      });
      if (conflict) throw new ConflictException('Identity data conflict');
    }

    await driver.update(dto as any);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: DriverStatus) {
    const driver = await this.findOne(id);
    await driver.update({ status })
   
    
    return {
      id: driver.id,
      status: driver.status,
      updatedAt: driver.updatedAt
    };
  }

  async remove(id: string) {
    const driver = await this.findOne(id);
    await driver.destroy();
    return { success: true };
  }

  async findWaybills(id: string, startDate?: string, endDate?: string) {
    await this.findOne(id);
    return {
      driverId: id,
      period: { startDate, endDate },
      data: []
    };
  }
}