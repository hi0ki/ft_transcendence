import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,
        private jwtService: JwtService) { }


    async register(email: string, password: string, username: string) {
        const normalizedEmail = email.toLowerCase();

        const emailCheck = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (emailCheck) {
            throw new ConflictException('Email already exists');
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash: hashPassword,
                role: 'USER',
            }
        });

        let finalUsername = username;
        const existingProfile = await this.prisma.profile.findUnique({ where: { username } });
        if (existingProfile) {
            finalUsername = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const profile = await this.prisma.profile.create({
            data: {
                userId: user.id,
                username: username,
                avatarUrl: null,
                bio: null,
            }
        });
        return { id: user.id, email: normalizedEmail, username: profile.username };
    }


    async login(email: string, password: string) {
        const normalizedEmail = email.toLowerCase();
        const user = await this.prisma.user.findUnique({
            where : {email : normalizedEmail},
            include: { profile: { select: { username: true } } },
        });
        if (user)
        {
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Wrong password');
            }
            const profile = await this.prisma.profile.findUnique({ where: { userId: user.id } });
            const token = this.jwtService.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                username: profile?.username || null,
                avatarUrl: profile?.avatarUrl || null,
            });
            return { access_token: token };
        }
        else {
            throw new UnauthorizedException('Invalid credentials');
        }
    }



    async Create42User(data: { fortyTwoId: string; email: string; username: string; avatar: string; }) {
        let user = await this.prisma.user.findFirst({
            where: {
                oauthProvider: '42',
                oauthId: String(data.fortyTwoId),
            }
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    oauthProvider: '42',
                    oauthId: String(data.fortyTwoId),
                    passwordHash: null,
                    role: 'USER',
                }
            });

            let username = data.username;
            const existingProfile = await this.prisma.profile.findUnique({ where: { username } });
            if (existingProfile) {
                username = `${data.username}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            await this.prisma.profile.create({
                data: {
                    userId: user.id,
                    username: username,
                    avatarUrl: data.avatar,
                    bio: null,
                }
            });
        }

        const profile = await this.prisma.profile.findUnique({ where: { userId: user.id } });

        const token = this.jwtService.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            username: profile?.username || null,
            avatarUrl: profile?.avatarUrl || null,
        });
        return { access_token: token };
    }
}
