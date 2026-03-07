import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';

const COOKIE_OPTIONS = {
    httpOnly: true,        // JS cannot read it — XSS protection
    secure: true,          // HTTPS only
    sameSite: 'strict' as const,  // CSRF protection
    maxAge: 3600000,       // 1 hour in milliseconds
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
        @Res() res: Response           // ← added
    ) {
        const token = await this.authService.login(
            loginDto.email,
            loginDto.password
        );
        res.cookie('auth_token', token, COOKIE_OPTIONS);  // ← set cookie
        return res.json({ message: 'Logged in successfully' });
    }

    @Post('logout')                    // ← added
    logout(@Res() res: Response) {
        res.clearCookie('auth_token'); // ← delete cookie
        return res.json({ message: 'Logged out successfully' });
    }

    @Get('refresh')
    @UseGuards(AuthGuard)
    async refresh(
        @Req() req: any,
        @Res() res: Response           // ← added
    ) {
        const token = await this.authService.refreshToken(req.user.id);
        res.cookie('auth_token', token, COOKIE_OPTIONS);  // ← refresh cookie
        return res.json({ message: 'Token refreshed' });
    }

    @Get('42')
    @UseGuards(PassportAuthGuard('42'))
    fortyTwoAuth() { }

    @Get('42/callback')
    @UseGuards(PassportAuthGuard('42'))
    fortyTwoCallback(@Req() req: any, @Res() res: Response) {
        const token = req.user;                           // ← plain string now
        res.cookie('auth_token', token, COOKIE_OPTIONS);  // ← set cookie
        res.redirect('https://localhost/home');            // ← no token in URL
    }

    @Get('health')
    health() {
        return { status: 'ok' };
    }
}