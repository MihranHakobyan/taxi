import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '../driver.model';

export class DriverQueryDto {
  @ApiPropertyOptional({ 
    default: 1, 
    description: 'The page number for pagination' 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ 
    default: 20, 
    description: 'Number of drivers per page (max 100)' 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 20;

  @ApiPropertyOptional({ 
    enum: DriverStatus, 
    description: 'Filter drivers by their current status' 
  })
  @IsOptional()
  @IsEnum(DriverStatus, { message: 'Invalid status value' })
  status?: DriverStatus;

  @ApiPropertyOptional({ 
    description: 'Search by first name, last name, or email' 
  })
  @IsOptional()
  @IsString()
  search?: string;
}