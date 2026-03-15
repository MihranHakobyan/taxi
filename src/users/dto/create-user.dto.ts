import {
    IsEmail, IsNotEmpty, IsString, MinLength,
    IsEnum, IsOptional, IsNotEmpty as IsRequired
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
    @ApiProperty({
        example: 'mihran.dev@example.com',
        description: 'The unique email address for the user account'
    })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @ApiProperty({
        example: 'mihran_hakobyan',
        description: 'A unique username for the user'
    })
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    @Transform(({ value }) => value?.trim())
    username: string;

    @ApiProperty({
        example: 'securePass123',
        description: 'The password for the user (minimum 6 characters)'
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiProperty({
        example: 'Mihran',
        description: 'The first name of the user'
    })
    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @Transform(({ value }) => value?.trim())
    firstName: string;

    @ApiProperty({
        example: 'Hakobyan',
        description: 'The last name of the user'
    })
    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    @Transform(({ value }) => value?.trim())
    lastName: string;

    @ApiProperty({
        enum: Role,
        default: Role.USER,
        required: false,
        description: 'The role assigned to the user (defaults to USER)'
    })
    @IsEnum(Role, { message: 'Invalid role assigned' })
    @IsOptional()
    role?: Role;
}