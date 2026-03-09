import { 
  IsEmail, IsNotEmpty, IsString, IsDateString, 
  IsEnum, IsOptional, MinLength, IsPhoneNumber, 
  Matches 
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { DriverStatus } from '../driver.model';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{6,20}$/, { message: 'License number must be alphanumeric' })
  licenseNumber: string;

  @IsDateString()
  licenseExpiry: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}

export class UpdateDriverDto extends PartialType(CreateDriverDto) {}