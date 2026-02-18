import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';

Module({
    imports : [],
    controllers : [ProfilesController],
    providers : [ProfilesService, PrismaService]

})
export class ProfilesModule{}
