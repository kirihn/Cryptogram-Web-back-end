import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.servise';
import { CryptogramGateway } from 'src/webSocket/cryptogram.gateway';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
    controllers: [ChatController],
    providers: [
        ChatService,
        PrismaService,
        CryptogramGateway,
        JwtService,
        ConfigService,
    ],
})
export class ChatModule {}
