import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class ForgotPasswordPhoneDto {
  @ApiProperty({
    example: '+37494123456',
    description: 'The phone number of the driver to send OTP code',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}