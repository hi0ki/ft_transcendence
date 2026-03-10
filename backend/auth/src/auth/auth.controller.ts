import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    maxAge: 3600000,
    path: '/',
};


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(
            registerDto.email,
            registerDto.password,
            registerDto.username
        );
    }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res() res: Response
    ) {
        const token = await this.authService.login(
            loginDto.email,
            loginDto.password
        );
        res.cookie('auth_token', token, COOKIE_OPTIONS);
        return res.json({ message: 'Logged in successfully' });
    }

    @Post('logout')
    logout(@Res() res: Response) {
        res.clearCookie('auth_token');
        return res.json({ message: 'Logged out successfully' });
    }

    @Get('refresh')
    @UseGuards(AuthGuard)
    async refresh(
        @Req() req: any,
        @Res() res: Response
    ) {
        const token = await this.authService.refreshToken(req.user.id);
        res.cookie('auth_token', token, COOKIE_OPTIONS);
        return res.json({ message: 'Token refreshed' });
    }

    @Get('42')
    @UseGuards(PassportAuthGuard('42'))
    fortyTwoAuth() { }

    @Get('42/callback')
    @UseGuards(PassportAuthGuard('42'))
    fortyTwoCallback(@Req() req: any, @Res() res: Response) {
        const token = req.user;
        res.cookie('auth_token', token, COOKIE_OPTIONS);
        res.redirect('https://localhost/home');
    }

    @Get('health')
    health() {
        return { status: 'ok' };
    }
}