import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController{
    constructor(private authService : AuthService){}

    @Get()
    hello() :string{
        return "Hello Auth";
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto){
        return this.authService.register(registerDto.email, registerDto.password);
    }

    @Post('login')
    async login(@Body() registerDto: RegisterDto){
        return this.authService.login(registerDto.email, registerDto.password);
    }
    
}
