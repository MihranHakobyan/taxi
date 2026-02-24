import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
export class RegisterDto {
    @IsString() @IsNotEmpty() username!: string;
    @IsEmail() email!: string;
    @IsString() @MinLength(6) password!: string;
    @IsEnum(['Admin', 'User']) role!: string;
}