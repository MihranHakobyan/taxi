import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register/user')
    registerUser(@Body() dto: CreateUserDto) {
        return this.authService.register(dto, false);
    }

    @Post('register/driver')
    registerDriver(@Body() dto: CreateDriverDto) {
        return this.authService.register(dto, true);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        const entity = await this.authService.validateUser(dto.email, dto.password);
        if (!entity) throw new UnauthorizedException('Invalid credentials');
        return this.authService.login(entity);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Req() req: any) {
        return this.authService.logout(req.user.userId, req.user.role);
    }
}