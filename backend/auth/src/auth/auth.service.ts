import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private prisma :PrismaService){}
        // private jwtService :JwtService){}


    async register(email :string, password :string) {
        // if (await this.prisma.users.findUnique({where : {email}})){
        //     throw new Error('Email already used');
        // throw new BadRequestException('Email already used');
        // }
        const hashPassword =  await bcrypt.hash(password, 10);
        const user = await this.prisma.users.create({
            data :{
                email,
                passwordHash : hashPassword
            }
        });
        // return user;
        return {id : user.id, email};
    }

    async login(email :string, password :string){
    //     //ghadi nchof la kan  l mail kayel donc mezyan ghadi ntcheki passworrd on logi normal
    //     const user = await this.prisma.users.findUnique({where : {email}});
    //     if (user)
    //     {
    //         const check = bcrypt.compare(password, (await this.prisma.users.findUnique({where : {email}})).passwordHash);
    //         if (!check)
    //             throw new Error('Invalid password');
    //         const token = this.jwtService.sign({ id: user.id, email: user.email});
    //         return { access_token: token };
    //     }
    //     else {
    //         throw new Error('User not found');
    //     }
    }
}