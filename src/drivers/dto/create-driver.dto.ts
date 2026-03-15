import {
  IsEmail, IsNotEmpty, IsString, IsDateString,
  IsEnum, IsOptional, MinLength, IsPhoneNumber,
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { DriverStatus } from '../driver.model';

export class CreateDriverDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{6,20}$/, { message: 'License number must be alphanumeric' })
  licenseNumber: string;

  @ApiProperty()
  @IsDateString()
  licenseExpiry: Date;

  @ApiPropertyOptional({ enum: DriverStatus, default: DriverStatus.ACTIVE })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}

export class UpdateDriverDto extends PartialType(CreateDriverDto) { }