import { Injectable , ConflictException , UnauthorizedException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private prisma :PrismaService,
        private jwtService :JwtService){}

    async register(email :string, password :string) {
        const normalizedEmail = email.toLowerCase();
        const check = await this.prisma.user.findUnique({where : {email : normalizedEmail}});
        if (check){
            throw new ConflictException('Email already exists');
        // throw new BadRequestException('Email already used');
        }

        const hashPassword =  await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data :{
                email : normalizedEmail,
                passwordHash : hashPassword,
                role: 'USER',
            }
        });
        const username = normalizedEmail.split('@')[0]; // Example: "john1"
        const profile = await this.prisma.profile.create({
            data: {
                userId: user.id,
                username: username,
                fullName: null,
                avatarUrl: null,
                bio: null,
            }
        });
        console.log("Creating user with profile...");
        return {id : user.id, email : normalizedEmail};
    }

    async login(email :string, password :string){
    //     //ghadi nchof la kan  l mail kayel donc mezyan ghadi ntcheki passworrd on logi normal
        const normalizedEmail = email.toLowerCase();
        const user = await this.prisma.user.findUnique({where : {email : normalizedEmail}});
        if (user)
        {
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
              throw new UnauthorizedException('Wrong password');
            }
            const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role});
            return { access_token: token };
        }
        else {
            throw new UnauthorizedException('Invalid credentials');
        }
    }


    async Create42User(data: { fortyTwoId: string; email: string; username: string; avatar: string;}) 
    {
        let user = await this.prisma.user.findFirst({
            where: {
                oauthProvider: '42',
                oauthId:       String(data.fortyTwoId),
            }
        });
    
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email:         data.email,
                    oauthProvider: '42',
                    oauthId:       String(data.fortyTwoId),
                    passwordHash:  null,
                    role:          'USER',
                }
            });

            await this.prisma.profile.create({
                data: {
                    userId:    user.id,
                    username:  data.username,
                    avatarUrl: data.avatar,
                    fullName:  null,
                    bio:       null,
                }
            });
        }
    
        const token = this.jwtService.sign({
            id:    user.id,
            email: user.email,
            role:  user.role,
        });
        return { access_token: token };
    }
}

