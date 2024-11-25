import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/prisma.servise';
import { ChatGateway } from './chat.gateway';

@Module({
    controllers: [ChatController],
    providers: [ChatService, PrismaService, ChatGateway],
})
export class ChatModule {}
