import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { Car } from './car.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Car]),
  ],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService, SequelizeModule],
})
export class CarsModule {}