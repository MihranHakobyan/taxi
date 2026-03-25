import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Car } from './car.model';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Driver } from '../drivers/driver.model';

@Injectable()
export class CarsService {
  constructor(
    @InjectModel(Car)
    private readonly carModel: typeof Car,
  ) {}

  async create(dto: CreateCarDto) {
    const existingCar = await this.carModel.findOne({
      where: { plateNumber: dto.plateNumber },
    });

    if (existingCar) {
      throw new ConflictException('Car with this plate number already exists');
    }

    const car = await this.carModel.create(dto);

    return {
      id: car.id,
      status: car.status,
      message: 'Car created successfully',
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const offset = (Number(page) - 1) * Number(limit);
    
    const { rows, count } = await this.carModel.findAndCountAll({
      limit: Number(limit),
      offset,
      include: [
        {
          model: Driver,
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      data: rows.map((car) => ({
        id: car.id,
        brand: car.brand,
        model: car.model,
        plateNumber: car.plateNumber,
        status: car.status,
        driverName: car.currentDriver
          ? `${car.currentDriver.firstName} ${car.currentDriver.lastName}`
          : null,
      })),
      total: count,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string) {
    const car = await this.carModel.findByPk(id, {
      include: [
        {
          model: Driver,
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const { currentDriver, ...carData } = car.get({ plain: true });

    return {
      ...carData,
      currentDriver: currentDriver
        ? {
            id: currentDriver.id,
            name: `${currentDriver.firstName} ${currentDriver.lastName}`,
          }
        : null,
    };
  }

  async update(id: string, dto: UpdateCarDto) {
    const car = await this.carModel.findByPk(id);
    
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    await car.update(dto);

    return {
      message: 'Car updated successfully',
    };
  }

  async remove(id: string) {
    const car = await this.carModel.findByPk(id);
    
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    await car.destroy();

    return {
      message: 'Car deleted',
    };
  }
}