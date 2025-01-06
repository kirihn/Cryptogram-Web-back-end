import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
    controllers: [ChatController],
    providers: [
        ChatService,
        PrismaService,
        ChatGateway,
        JwtService,
        ConfigService,
    ],
})
export class ChatModule {}
