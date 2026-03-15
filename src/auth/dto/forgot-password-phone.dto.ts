import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class ForgotPasswordPhoneDto {
  @ApiProperty({
    example: '+37494123456',
    description: 'The registered phone number of the driver in international format',
    format: 'phone',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsPhoneNumber(null, { message: 'Invalid phone number format (use international format like +374...)' })
  phone: string;
}