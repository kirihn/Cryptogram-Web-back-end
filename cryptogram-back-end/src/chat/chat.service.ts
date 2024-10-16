import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/createChat.dto';
import { PrismaService } from 'src/prisma.servise';
import { AddMemberDto } from './dto/addMember.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}
    async Create(dto: CreateChatDto, userId: string) {
        const chat = await this.prisma.$transaction(async (prisma) => {
            const chat = await prisma.chats.create({
                data: {
                    ChatName: dto.chatName,
                    IsGroup: dto.isGroup,
                    KeyHash: dto.keyHash,
                },
            });

            await prisma.chatMembers.create({
                data: {
                    UserId: userId,
                    ChatId: chat.ChatId,
                    Role: 1,
                },
            });

            return chat;
        });

        return chat;
    }

    async AddMember(dto: AddMemberDto, userId: string) {
        return `This action returns all chat` + dto + userId;
    }

    findOne(id: number) {
        return `This action returns a #${id} chat`;
    }

    remove(id: number) {
        return `This action removes a #${id} chat`;
    }
}
