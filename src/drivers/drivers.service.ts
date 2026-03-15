import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, HttpException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
// import * as crypto from 'crypto';
// import { SmsService } from '../sms/sms.service';
import { Driver, DriverStatus } from './driver.model';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto';

@Injectable()
export class DriversService {
  constructor(
    @InjectModel(Driver) private readonly driverModel: typeof Driver,
    private readonly sequelize: Sequelize,
    private readonly configService: ConfigService,
    // private readonly smsService: SmsService,
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
      attributes: ['id', 'email', 'phone', 'licenseNumber']
    });

    if (existing) {
      const field = existing.email === dto.email ? 'Email' :
        existing.phone === dto.phone ? 'Phone' : 'License number';
      throw new ConflictException(`${field} already in use`);
    }

    const serverSalt = this.configService.get<string>('PASSWORD_SALT');
    const hashedPassword = await bcrypt.hash(dto.password + serverSalt, 10);

    return await this.driverModel.sequelize.transaction(async (transaction) => {
      try {
        const driver = await this.driverModel.create(
          {
            ...dto,
            password: hashedPassword
          },
          { transaction }
        );

        const { password, resetPasswordToken, resetPasswordExpires, ...result } = driver.get({ plain: true });
        return result;
      } catch (error) {
        throw new InternalServerErrorException('An error occurred while creating the driver account');
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
    if (dto.password) {
      const serverSalt = this.configService.get<string>('PASSWORD_SALT');
      dto.password = await bcrypt.hash(dto.password + serverSalt, 10);
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

  //twillo e anhrajesht vor ashxati dra hamar em comment arel 
  // async createPhoneResetCode(phone: string): Promise<void> {
  //   const driver = await this.driverModel.findOne({ where: { phone } });

  //   if (!driver) {
  //     throw new NotFoundException('Driver not found');
  //   }

  //   const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  //   const salt = this.configService.get<string>('TOKEN_SALT') || '';
  //   const hashedCode = crypto.createHash('sha256').update(otpCode + salt).digest('hex');

  //   await driver.update({
  //     resetPasswordToken: hashedCode,
  //     resetPasswordExpires: new Date(Date.now() + 600000),
  //   });

  //   await this.smsService.sendOtp(phone, otpCode);
  // }

  async resetPasswordByPhone(phone: string, code: string, newPassword: string): Promise<void> {
    const salt = this.configService.get<string>('TOKEN_SALT') || '';
    const hashedCode = crypto.createHash('sha256').update(code + salt).digest('hex');

    const transaction = await this.driverModel.sequelize.transaction();

    try {
      const driver = await this.driverModel.findOne({
        where: {
          phone,
          resetPasswordToken: hashedCode,
          resetPasswordExpires: { [Op.gt]: new Date() },
        },
        transaction,
      });

      if (!driver) {
        throw new BadRequestException('Invalid or expired reset code');
      }
      const serverSalt = this.configService.get<string>('PASSWORD_SALT');
      const passwordToHash = newPassword + serverSalt;
      const hashedPassword = await bcrypt.hash(passwordToHash, 10);

      await driver.update(
        {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('An unexpected error occurred during password reset');
    }
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