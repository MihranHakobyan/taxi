import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({ example: 'uuid-v4-here' })
    @IsUUID()
    @IsNotEmpty()
    waybillId: string;

    @ApiProperty({ example: 1500.50 })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    amount: number;
}