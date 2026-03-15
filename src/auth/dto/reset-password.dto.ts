import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ 
    example: '5f1b2c3d4e5f...', 
    description: 'The token received in the email' 
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ 
    example: 'new_secure_password123', 
    description: 'Minimum 8 characters' 
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}