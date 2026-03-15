import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WaybillQueryDto {
  @ApiPropertyOptional({ 
    example: '2024-01-01', 
    description: 'Filter waybills starting from this date (ISO 8601 format)' 
  })
  @IsOptional()
  @IsDateString({}, { message: 'startDate must be a valid ISO date string (YYYY-MM-DD)' })
  startDate?: string;

  @ApiPropertyOptional({ 
    example: '2024-01-31', 
    description: 'Filter waybills up to this date (ISO 8601 format)' 
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid ISO date string (YYYY-MM-DD)' })
  endDate?: string;
}