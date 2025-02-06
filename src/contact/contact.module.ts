import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.servise';
import { CryptogramGateway } from 'src/webSocket/cryptogram.gateway';

import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';

@Module({
    controllers: [ContactController],
    providers: [
        ContactService,
        PrismaService,
        CryptogramGateway,
        JwtService,
        ConfigService,
    ],
})
export class ContactModule {}
