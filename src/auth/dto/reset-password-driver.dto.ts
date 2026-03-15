import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDriverDto {
  @ApiProperty({ example: '+37499112233' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456', description: 'The 6-digit code received via SMS' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: 'new_strong_password_123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}