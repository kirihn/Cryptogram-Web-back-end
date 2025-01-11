import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';

import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';

@Module({
    controllers: [ContactController],
    providers: [ContactService, PrismaService],
})
export class ContactModule {}
