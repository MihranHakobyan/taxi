import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateWaybillDto } from './create-waybill.dto';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { WaybillStatus } from '../waybill.model';

export class UpdateWaybillDto extends PartialType(CreateWaybillDto) {
    @ApiPropertyOptional({ example: '20:00' })
    @IsOptional()
    @IsString()
    endTime?: string;

    @ApiPropertyOptional({ example: 120240 })
    @IsOptional()
    @IsNumber()
    endMileage?: number;

    @ApiPropertyOptional({ enum: WaybillStatus })
    @IsOptional()
    @IsEnum(WaybillStatus)
    status?: WaybillStatus;
}