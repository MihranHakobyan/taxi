import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
export class AuthFlowDto {
  @IsOptional() @IsString() refreshToken?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() token?: string;
  @IsOptional() @IsString() @MinLength(6) newPassword?: string;
}