import { Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController{
    constructor(private authService : AuthService){}

    // @Post('register')
    @Get()
    hello() :string{
        return "Hello Auth";
    }
    
}