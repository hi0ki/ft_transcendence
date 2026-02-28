import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto.email, registerDto.password, registerDto.username);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }


    @Get('42')
    @UseGuards(PassportAuthGuard('42'))
    fortyTwoAuth() { }


    @Get('42/callback')
    @UseGuards(PassportAuthGuard('42'))
    fortyTwoCallback(@Req() req: any, @Res() res: any) {
        const token = req.user.access_token;
        res.redirect(`http://localhost:8080/callback?token=${token}`);
    }

}

