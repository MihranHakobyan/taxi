import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, MinLength, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CarStatus } from '../car.model';

export class CreateCarDto {
    @ApiProperty({ example: 'Toyota' })
    @IsString()
    @IsNotEmpty()
    brand: string;

    @ApiProperty({ example: 'Camry' })
    @IsString()
    @IsNotEmpty()
    model: string;

    @ApiProperty({ example: 2022 })
    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    @IsNotEmpty()
    year: number;

    @ApiProperty({ example: 'AA123BB' })
    @IsString()
    @IsNotEmpty()
    plateNumber: string;

    @ApiProperty({ example: '1HGCM82633A123456' })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    vin: string;

    @ApiProperty({ example: 'White' })
    @IsString()
    @IsNotEmpty()
    color: string;

    @ApiProperty({ enum: CarStatus, default: CarStatus.ACTIVE, required: false })
    @IsOptional()
    @IsEnum(CarStatus)
    status?: CarStatus;
}