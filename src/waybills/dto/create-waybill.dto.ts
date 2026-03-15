import { IsNotEmpty, IsUUID, IsDateString, IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaybillDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    @IsNotEmpty()
    driverId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsUUID()
    @IsNotEmpty()
    carId: string;

    @ApiProperty({ example: '2026-03-01' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ example: '08:00' })
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ example: 120000 })
    @IsNumber()
    @IsNotEmpty()
    startMileage: number;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    medicalCheck: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    technicalCheck: boolean;
}