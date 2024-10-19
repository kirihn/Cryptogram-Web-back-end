import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { CreateChatDto } from './dto/createChat.dto';
import { PrismaService } from 'src/prisma.servise';
import { AddMemberDto } from './dto/addMember.dto';
import { DeleteMember } from './dto/deleteMember.dto';
import { FixChatDto } from './dto/fixChat.dto';

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
        await this.ValidateAddMember(dto, userId);

        const NewMember = await this.prisma.chatMembers.create({
            data: {
                ChatId: dto.chatId,
                UserId: dto.userId,
                Role: dto.role,
            },
        });
        return NewMember;
    }

    async DeleteMember(dto: DeleteMember, userId: string) {
        const deleteMemberId = await this.ValidateDeleteMember(dto, userId);

        await this.prisma.chatMembers
            .delete({
                where: {
                    ChatMemberId: deleteMemberId,
                },
            })
            .catch((err) => {
                throw new BadRequestException(err);
            });

        return 'chatMemberDeleted';
    }

    async GetMyChats(userId: string) {
        return await this.prisma.chatMembers.findMany({
            where: {
                UserId: userId,
            },
            select: {
                ChatId: true,
                Role: true,
                IsFixed: true,
                ChatMemberId: true,
                Chat: {
                    select: {
                        ChatName: true,
                        IsGroup: true,
                        KeyHash: true,
                    },
                },
            },
        });
    }

    async FixChat(dto: FixChatDto, userId: string) {
        const isFixed = await this.ValidateFixChat(dto, userId);

        await this.prisma.chatMembers.update({
            where: {
                ChatMemberId: dto.chatMemberId,
            },
            data: {
                IsFixed: !isFixed,
            },
        });
        return '!Fix chat';
    }

    async ValidateFixChat(dto: FixChatDto, userId: string) {
        const isFixed = await this.prisma.chatMembers.findFirst({
            where: {
                ChatMemberId: dto.chatMemberId,
            },
            select: {
                IsFixed: true,
                UserId: true,
            },
        });

        if (!isFixed || isFixed.UserId !== userId)
            throw new BadRequestException({
                error: true,
                message: 'you are not a member of this chat',
            });

        return isFixed.IsFixed;
    }

    async ValidateDeleteMember(dto: DeleteMember, userId: string) {
        const members = await this.prisma.chatMembers.findMany({
            where: {
                ChatId: dto.chatId,
                UserId: {
                    in: [userId, dto.userId],
                },
            },
            select: {
                ChatMemberId: true,
                UserId: true,
                Role: true,
            },
        });

        const currentMember = members.find(
            (member) => member.UserId === userId,
        );
        const deletedMember = members.find(
            (member) => member.UserId === dto.userId,
        );

        if (!currentMember)
            throw new BadRequestException({
                error: true,
                message: 'you are not a member of this chat',
            });

        if (!deletedMember)
            throw new BadRequestException({
                error: true,
                message: 'deleted user are not a member of this chat',
            });

        if (deletedMember.UserId === currentMember.UserId)
            throw new BadRequestException({
                error: true,
                message: 'You cannot delete yourself, try leave from chat',
            });

        if (currentMember.Role >= deletedMember.Role)
            throw new ForbiddenException({
                error: true,
                message: 'You cannot del user with role than <= your role',
            });

        return deletedMember.ChatMemberId;
    }

    async ValidateAddMember(dto: AddMemberDto, userId: string) {
        const [member, isNewMember, isNewMemberExist] = await Promise.all([
            this.prisma.chatMembers.findFirst({
                where: {
                    UserId: userId,
                    ChatId: dto.chatId,
                },
                select: {
                    Role: true,
                },
            }),
            this.prisma.chatMembers.findFirst({
                where: {
                    ChatId: dto.chatId,
                    UserId: dto.userId,
                },
                select: {
                    ChatMemberId: true,
                },
            }),
            this.prisma.users.findUnique({
                where: {
                    UserId: dto.userId,
                },
                select: {
                    UserId: true,
                },
            }),
        ]);

        if (member.Role > dto.role)
            throw new ForbiddenException({
                error: true,
                message: 'You cannot grant roles larger than yours',
            });

        if (isNewMember)
            throw new BadRequestException({
                error: true,
                message: 'This user is already a member of the chat',
            });

        if (!isNewMemberExist)
            throw new ForbiddenException({
                error: true,
                message: 'This user does not exist',
            });
    }
}
