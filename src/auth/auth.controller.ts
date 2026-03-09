import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';

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
}