import { PartialType } from '@nestjs/swagger';
import { CreateCarDto } from './create-car.dto';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CarStatus } from '../car.model';

export class UpdateCarDto extends PartialType(CreateCarDto) {
  @ApiProperty({ enum: CarStatus, required: false })
  @IsOptional()
  @IsEnum(CarStatus)
  status?: CarStatus;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  @IsOptional()
  @IsUUID()
  currentDriverId?: string;
}