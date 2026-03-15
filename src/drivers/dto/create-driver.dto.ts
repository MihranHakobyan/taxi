import {
  IsEmail, IsNotEmpty, IsString, IsDateString,
  IsEnum, IsOptional, MinLength, IsPhoneNumber,
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { DriverStatus } from '../driver.model';

export class CreateDriverDto {
  @ApiProperty({ 
    example: 'John', 
    description: 'The first name of the driver' 
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ 
    example: 'Doe', 
    description: 'The last name of the driver' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ 
    example: 'driver@taxi.com', 
    description: 'The unique email address of the driver' 
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    example: 'strongPassword123', 
    description: 'Security password for the driver account (min 8 chars)' 
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ 
    example: '+37494123456', 
    description: 'International format phone number' 
  })
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ 
    example: 'AB123456', 
    description: 'Driver license number (alphanumeric, 6-20 characters)' 
  })
  @IsString()
  @IsNotEmpty({ message: 'License number is required' })
  @Matches(/^[A-Z0-9]{6,20}$/, { message: 'License number must be alphanumeric and between 6-20 characters' })
  licenseNumber: string;

  @ApiProperty({ 
    example: '2030-12-31', 
    description: 'The expiration date of the driver license' 
  })
  @IsDateString({}, { message: 'License expiry must be a valid ISO date string' })
  licenseExpiry: Date;

  @ApiPropertyOptional({ 
    enum: DriverStatus, 
    default: DriverStatus.ACTIVE,
    description: 'The current status of the driver in the system'
  })
  @IsOptional()
  @IsEnum(DriverStatus, { message: 'Invalid driver status' })
  status?: DriverStatus;
}

export class UpdateDriverDto extends PartialType(CreateDriverDto) { }