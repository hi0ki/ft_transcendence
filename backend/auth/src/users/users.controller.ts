import { Controller, Get } from '@nestjs/common';
import { Prisma } from '../src/prisma/prisma.service';

@Controller('users')
export class UsersController {
    @Get()
    findAll(): string {
        return 'hello world';
    }
}
