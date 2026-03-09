import { IsOptional, IsDateString } from 'class-validator';

export class WaybillQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}