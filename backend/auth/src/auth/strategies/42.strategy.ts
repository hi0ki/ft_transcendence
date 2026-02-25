import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private configService: ConfigService, private authService: AuthService) {
        super({
            clientID: configService.get('FORTYTWO_CLIENT_ID') || configService.get('CLIENT_ID'),
            clientSecret: configService.get('FORTYTWO_CLIENT_SECRET') || configService.get('CLIENT_SECRET'),
            callbackURL: configService.get('FORTYTWO_CALLBACK_URL') || configService.get('CALLBACK_URL'),
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        const user = await this.authService.Create42User({
            fortyTwoId: profile.id,
            email: profile.emails[0].value,
            username: profile.username,
            avatar: profile._json.image?.link,
        });
        return user;
    }
}

