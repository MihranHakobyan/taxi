import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDriverDto {
  @ApiProperty({ 
    example: '+37499112233', 
    description: 'The phone number of the driver in international format' 
  })
  @IsPhoneNumber(null, { message: 'Phone number must be in international format (e.g., +374...)' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({ 
    example: '123456', 
    description: 'The 6-digit OTP code received via SMS',
    minLength: 6,
    maxLength: 6 
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'The code must be exactly 6 digits long' })
  code: string;

  @ApiProperty({ 
    example: 'new_strong_password_123', 
    description: 'The new password for the account (minimum 8 characters)' 
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;
}