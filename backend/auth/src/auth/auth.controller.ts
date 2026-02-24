import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
// import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'; 

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


    // @Get('42')
    // @UseGuards(PassportAuthGuard('42'))
    // fortyTwoAuth() {}

    // // step 2 — 42 redirects back here after login
    // @Get('42/callback')
    // @UseGuards(PassportAuthGuard('42'))
    // fortyTwoCallback(@Req() req: any, @Res() res: any) {
    //     const token = req.user.access_token;
    //     res.redirect(`http://localhost:8080/auth/callback?token=${token}`);
    //     //                      ↑ change this to your React port
    // }
    
}
