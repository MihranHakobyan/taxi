import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ForgotPasswordEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The registered email address of the user who needs to reset their password',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  @Transform(({ value }) => value?.toLowerCase().trim()) // Silently cleans the input
  email: string;
}