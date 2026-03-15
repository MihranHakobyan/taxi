import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';
import { ForgotPasswordEmailDto } from './dto/forgot-password-email.dto';
import { ForgotPasswordPhoneDto } from './dto/forgot-password-phone.dto';
import { ResetPasswordDriverDto } from './dto/reset-password-driver.dto';

@ApiTags('Authentication') // More formal tag name
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register/user')
    @ApiOperation({ summary: 'Register a new passenger' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
    registerUser(@Body() dto: CreateUserDto) {
        return this.authService.register(dto, false);
    }

    @Post('register/driver')
    @ApiOperation({ summary: 'Register a new driver' })
    @ApiResponse({ status: 201, description: 'Driver successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
    registerDriver(@Body() dto: CreateDriverDto) {
        return this.authService.register(dto, true);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User/Driver login' })
    @ApiResponse({ status: 200, description: 'Login successful, returns tokens' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
    async login(@Body() dto: LoginDto) {
        const entity = await this.authService.validateUser(dto.email, dto.password);
        if (!entity) throw new UnauthorizedException('Invalid credentials');
        return this.authService.login(entity);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: { refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' } }
        }
    })
    @ApiResponse({ status: 200, description: 'New access token generated' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }

    @ApiBearerAuth('accessToken')
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout current user' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    logout(@Req() req: any) {
        return this.authService.logout(req.user.userId, req.user.role);
    }

    @Post('forgot-password/email')
    @ApiOperation({ summary: 'Send reset password link to email (for Admins/Users)' })
    @ApiResponse({ status: 200, description: 'Reset link sent to email' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async forgotPasswordEmail(@Body() dto: ForgotPasswordEmailDto) {
        return this.authService.forgotPasswordUser(dto.email);
    }

    @Post('reset-password/user')
    @ApiOperation({ summary: 'Reset user password using a token' })
    @ApiResponse({ status: 200, description: 'Password successfully reset' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return await this.authService.resetPasswordUser(dto);
    }

    //   @Post('forgot-password/phone')
    //   @HttpCode(HttpStatus.OK)
    //   @ApiOperation({ summary: 'Send password reset OTP to driver phone' })
    //   @ApiResponse({ status: 200, description: 'OTP code sent to phone' })
    //   async forgotPasswordPhone(@Body() dto: ForgotPasswordPhoneDto) {
    //     return await this.authService.forgotPasswordPhone(dto.phone);
    //   }

    @Post('reset-password/phone')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset driver password using OTP' })
    @ApiResponse({ status: 200, description: 'Driver password successfully reset' })
    @ApiResponse({ status: 400, description: 'Invalid OTP code' })
    async resetPasswordPhone(@Body() dto: ResetPasswordDriverDto) {
        return await this.authService.resetPasswordPhone(dto);
    }
}