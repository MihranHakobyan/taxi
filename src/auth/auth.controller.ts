import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';
import { ForgotPasswordEmailDto } from './dto/forgot-password-email.dto';
import { ForgotPasswordPhoneDto } from './dto/forgot-password-phone.dto';
import { ResetPasswordDriverDto } from './dto/reset-password-driver.dto';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register/user')
    @ApiOperation({ summary: 'Register a new passenger' })
    registerUser(@Body() dto: CreateUserDto) {
        return this.authService.register(dto, false);
    }

    @Post('register/driver')
    @ApiOperation({ summary: 'Register a new driver' })
    registerDriver(@Body() dto: CreateDriverDto) {
        return this.authService.register(dto, true);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User/Driver login' })
    async login(@Body() dto: LoginDto) {
               
        const entity = await this.authService.validateUser(dto.email, dto.password);
        if (!entity) throw new UnauthorizedException('Invalid credentials');
        return this.authService.login(entity);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
    refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }
    @ApiBearerAuth('accessToken')
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout current user' })
    logout(@Req() req: any) {
        return this.authService.logout(req.user.userId, req.user.role);
    }

    @Post('forgot-password/email')
    @ApiOperation({ summary: 'Send reset password link to email (for Admins/Users)' })
    async forgotPasswordEmail(@Body() dto: ForgotPasswordEmailDto) {
        return this.authService.forgotPasswordUser(dto.email);
    }

    @Post('reset-password/user')
    @ApiOperation({ summary: 'Reset user password using a token' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return await this.authService.resetPasswordUser(dto);
    }

    //twillo e anhrajesht vor ashxati dra hamar em comment arel
    // @Post('forgot-password/phone')
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: 'Send password reset OTP to driver phone' })
    // async forgotPasswordPhone(@Body() dto: ForgotPasswordPhoneDto) {
    //     return await this.authService.forgotPasswordPhone(dto.phone);
    // }

    @Post('reset-password/phone')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset driver password using OTP' })
    async resetPasswordPhone(@Body() dto: ResetPasswordDriverDto) {
        return await this.authService.resetPasswordPhone(dto);
    }
}