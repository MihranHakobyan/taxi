import { IsEmail, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'mihran_new',
        description: 'Update the unique username'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    username?: string;

    @ApiPropertyOptional({
        example: 'new.email@example.com',
        description: 'Update the email address'
    })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @ApiPropertyOptional({
        example: 'newStrongPass123',
        description: 'Update the password (minimum 6 characters)'
    })
    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password?: string;

    @ApiPropertyOptional({
        example: true,
        description: 'Update the active status of the user'
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}