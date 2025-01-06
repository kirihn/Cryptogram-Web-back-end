import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';

import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
    controllers: [ProfileController],
    providers: [ProfileService, PrismaService],
})
export class SettingsModule {}
