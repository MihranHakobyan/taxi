import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}