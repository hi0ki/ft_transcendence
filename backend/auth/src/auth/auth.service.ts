import { Injectable , ConflictException , UnauthorizedException, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private prisma :PrismaService,
        private jwtService :JwtService){}


    async register(email :string, password :string) {
        const normalizedEmail = email.toLowerCase();
        const check = await this.prisma.users.findUnique({where : {email : normalizedEmail}});
        if (check){
            throw new ConflictException('Email already exists');
        // throw new BadRequestException('Email already used');
        }
        const hashPassword =  await bcrypt.hash(password, 10);
        const user = await this.prisma.users.create({
            data :{
                email,
                passwordHash : hashPassword
            }
        });
        return {id : user.id, email : normalizedEmail};
    }

    async login(email :string, password :string){
    //     //ghadi nchof la kan  l mail kayel donc mezyan ghadi ntcheki passworrd on logi normal
        const normalizedEmail = email.toLowerCase();
        const user = await this.prisma.users.findUnique({where : {email : normalizedEmail}});
        if (user)
        {
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
              throw new UnauthorizedException('Wrong password');
            }
            const token = this.jwtService.sign({ id: user.id, email: user.email});
            return { access_token: token };
        }
        else {
            throw new NotFoundException('User not found');
        }
    }
}