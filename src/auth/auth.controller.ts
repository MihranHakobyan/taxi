import { Controller, Post, Body, UseGuards, Req, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: AuthDto) { return this.authService.login(dto); }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(@Body('refreshToken') rt: string) { return this.authService.refresh(rt); }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(@Req() req) { return this.authService.logout(req.user.id); }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req) { return this.authService.getMe(req.user.id); }//sa karox enq hanel

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.id, dto);
    }

    @Post('forgot-password')
    forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}