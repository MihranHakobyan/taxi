import { IsOptional, IsEnum, IsUUID, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WaybillStatus } from '../waybill.model';

export class WaybillQueryDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;

    @ApiPropertyOptional({ enum: WaybillStatus })
    @IsOptional()
    @IsEnum(WaybillStatus)
    status?: WaybillStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    driverId?: string;

    @ApiPropertyOptional({ description: 'Format: YYYY-MM-DD' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ description: 'Format: YYYY-MM-DD' })
    @IsOptional()
    @IsDateString()
    to?: string;
}