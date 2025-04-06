import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma.servise';
import { CryptogramGateway } from 'src/webSocket/cryptogram.gateway';

import { CreateChatDto } from './dto/createChat.dto';
import { AddMemberDto } from './dto/addMember.dto';
import { DeleteMember } from './dto/deleteMember.dto';
import { FixChatDto } from './dto/fixChat.dto';
import { GetChatInfoDto } from './dto/getChatInfo.dto';
import { LeaveFromChatDto } from './dto/leaveFromChat.dto';
import { ChatMessage, NewMessageDto } from './dto/chatMessage.dto';
import { UpdateChatNameDto } from './dto/updateChatName.dto';
import { DeleteMessageDto } from './dto/deleteMessage.dto';
import { UpdateMessageDto } from './dto/updateMessage.dto';
import { Sticker, StickerPack } from './dto/stickerPack';

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        private readonly wsGateway: CryptogramGateway,
    ) {}

    async CreateChat(dto: CreateChatDto, userId: string) {
        const chat = await this.prisma.$transaction(async (prisma) => {
            const chat = await prisma.chats.create({
                data: {
                    ChatName: dto.chatName,
                    IsGroup: dto.isGroup,
                    KeyHash: dto.keyHash,
                },
            });

            if (dto.isGroup) {
                await prisma.chatMembers.create({
                    data: {
                        UserId: userId,
                        ChatId: chat.ChatId,
                        Role: 1,
                    },
                });
            } else {
                await prisma.chatMembers.create({
                    data: {
                        UserId: userId,
                        ChatId: chat.ChatId,
                        Role: 4,
                    },
                });
                await prisma.chatMembers.create({
                    data: {
                        UserId: dto.userId,
                        ChatId: chat.ChatId,
                        Role: 4,
                    },
                });
            }

            return chat;
        });

        return chat;
    }

    async AddMember(dto: AddMemberDto, userId: string) {
        if (dto.username[0].toLocaleLowerCase() == '@')
            dto.username = dto.username.slice(1);

        const addedUser = await this.prisma.users.findUnique({
            where: {
                UserName: dto.username,
            },
            select: {
                UserId: true,
            },
        });

        if (!addedUser)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'User @' + dto.username + ' not found',
            });

        dto.userId = addedUser.UserId;

        await this.ValidateAddMember(dto, userId);

        const NewMember = await this.prisma.chatMembers.create({
            data: {
                ChatId: dto.chatId,
                UserId: dto.userId,
                Role: dto.role,
            },
        });

        this.wsGateway.AddUserToChat(dto.userId);

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

        this.wsGateway.DeleteUserFromChat(dto.userId, dto.chatId);

        return { message: 'chatMemberDeleted' };
    }

    async LeaveFromChat(dto: LeaveFromChatDto, userId: string) {
        const member = await this.ValidateLeaveFromChat(dto, userId);

        await this.prisma
            .$transaction(async (prisma) => {
                await prisma.chatMembers.delete({
                    where: {
                        ChatMemberId: member.ChatMemberId,
                    },
                });

                const coutMembers = await prisma.chatMembers.count({
                    where: {
                        ChatId: member.ChatId,
                    },
                });

                if (coutMembers === 0) {
                    await prisma.messages.deleteMany({
                        where: {
                            ChatId: member.ChatId,
                        },
                    });
                    await prisma.chats.delete({
                        where: {
                            ChatId: member.ChatId,
                        },
                    });
                }
            })
            .catch((err) => {
                throw new BadRequestException({ error: true, message: err });
            });

        return { message: 'You leave from this chat' };
    }

    async GetMyChats(userId: string) {
        const chats = await this.prisma.chatMembers.findMany({
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
                        AvatarPath: true,
                        ChatMembers: {
                            select: {
                                Member: true,
                            },
                        },
                    },
                },
            },
        });

        return chats.map(({ Chat, ...rest }) => ({
            ...rest,
            ...Chat,
        }));
    }

    async GetChatInfo(dto: GetChatInfoDto, userId: string) {
        const chatInfo = await this.prisma.chats.findUnique({
            where: {
                ChatId: dto.chatId,
                ChatMembers: {
                    some: {
                        UserId: userId,
                    },
                },
            },
            select: {
                ChatId: true,
                ChatName: true,
                IsGroup: true,
                KeyHash: true,
                AvatarPath: true,
                CreatedAt: true,
                UpdatedAt: true,
                ChatMembers: {
                    select: {
                        ChatMemberId: true,
                        Role: true,
                        ChatId: true,
                        JoinedAt: true,
                        Member: {
                            select: {
                                UserId: true,
                                Name: true,
                                AvatarPath: true,
                                UserName: true,
                            },
                        },
                    },
                },
                ChatMessages: {
                    select: {
                        MessageId: true,
                        Content: true,
                        MessageType: true,
                        IsUpdate: true,
                        IsRead: true,
                        CreatedAt: true,
                        SenderId: true,
                    },
                },
            },
        });

        if (!chatInfo)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'You are not a member of this chat.',
            });

        return chatInfo;
    }

    async AddMessage(dto: NewMessageDto, userId: string) {
        await this.ValidateAddMessage(dto, userId);

        const newMessage: ChatMessage = await this.prisma.messages.create({
            data: {
                ChatId: dto.chatId,
                SenderId: userId,
                Content: dto.content,
                MessageType: dto.messageType,
            },
            select: {
                MessageId: true,
                Content: true,
                MessageType: true,
                IsUpdate: true,
                IsRead: true,
                CreatedAt: true,
                SenderId: true,
            },
        });

        const chatMembers = await this.GetChatMembers(dto.chatId);

        chatMembers.ChatMembers.forEach((member) => {
            this.wsGateway.SendMessageToUser(
                newMessage,
                member.UserId,
                member.ChatId,
            );
        });
        return newMessage;
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
        return {
            message: '!Fix chat',
            chatMemberId: dto.chatMemberId,
            status: !isFixed,
        };
    }

    async UpdateAvatar(
        file: Express.Multer.File,
        userId: string,
        chatId: number,
    ) {
        // this.ValidateUpdateAvatar(userId, chatId);

        const uploadDir = 'static/uploads/chatAvatars';

        if (!fs.existsSync(uploadDir)) {
            throw new BadRequestException({
                error: true,
                show: false,
                message:
                    'server upload file error (no static/uploads/chatAvatars Directory)',
            });
        }

        const FileType = file.mimetype.substring(
            file.mimetype.indexOf('/') + 1,
        );
        const fileName = 'chatId-' + chatId + '.' + FileType;
        const filePath = `${uploadDir}/${fileName}`;

        try {
            fs.writeFileSync(filePath, file.buffer);
            console.log('Аватар чата загружен!');
        } catch (err) {
            throw new Error('Ошибка загрузки аватара: ' + err.message);
        }

        const chat = await this.prisma.chats.update({
            where: { ChatId: chatId },
            data: {
                AvatarPath: filePath,
            },
        });

        return chat;
    }

    async UploadChatFile(
        file: Express.Multer.File,
        userId: string,
        chatId: number,
    ) {
        const uploadDir = 'userUploads/chatFiles';

        if (!fs.existsSync(uploadDir)) {
            throw new BadRequestException({
                error: true,
                show: false,
                message:
                    'server upload file error (no userUploads/chatFiles Directory)',
            });
        }

        const fileName =
            'Time-' +
            Date.now() +
            'EndTime' +
            Buffer.from(file.originalname, 'latin1').toString('utf8');

        const filePath = path.join(uploadDir, `chatId-${chatId}`);
        const fullFilePath = path.join(filePath, fileName);

        try {
            fs.mkdirSync(filePath, { recursive: true });
            fs.writeFileSync(fullFilePath, file.buffer);
        } catch (err) {
            throw new Error('Ошибка загрузки аватара: ' + err.message);
        }
        let messageType: string;

        switch (file.mimetype.split('/')[0]) {
            case 'image':
                messageType = 'image';
                break;
            case 'video':
                messageType = 'video';
                break;
            case 'audio':
                messageType = 'audio';
                break;
            default:
                messageType = 'file';
        }

        const dto: NewMessageDto = {
            content: fullFilePath,
            chatId: chatId,
            messageType: messageType,
        };

        return await this.AddMessage(dto, userId);
    }

    async UpdateChatName(dto: UpdateChatNameDto) {
        await this.prisma.chats.update({
            where: {
                ChatId: dto.chatId,
            },
            data: {
                ChatName: dto.chatName,
            },
        });
        return { message: 'Chat name updated' };
    }

    async DeleteMessage(dto: DeleteMessageDto, userId: string) {
        await this.ValidateUserMessage(dto, userId);

        const chat = await this.prisma.messages.delete({
            where: {
                MessageId: dto.MessageId,
            },
            select: {
                ChatId: true,
                MessageType: true,
                Content: true,
            },
        });

        if (
            chat.MessageType == 'file' ||
            chat.MessageType == 'video' ||
            chat.MessageType == 'image' ||
            chat.MessageType == 'audio'
        ) {
            if (fs.existsSync(chat.Content)) {
                fs.unlinkSync(chat.Content);
            }
        }
        const chatMembers = await this.GetChatMembers(chat.ChatId);

        chatMembers.ChatMembers.forEach((member) => {
            this.wsGateway.DeleteMessageToUser(
                dto.MessageId,
                member.UserId,
                member.ChatId,
            );
        });

        return { message: 'successful' };
    }

    async UpdateMessage(dto: UpdateMessageDto, userId: string) {
        await this.ValidateUserMessage(dto, userId);

        const chat = await this.prisma.messages.update({
            where: {
                MessageId: dto.MessageId,
            },
            data: {
                Content: dto.newContent,
                IsUpdate: true,
            },
            select: {
                ChatId: true,
                Content: true,
            },
        });

        const chatMembers = await this.GetChatMembers(chat.ChatId);

        chatMembers.ChatMembers.forEach((member) => {
            this.wsGateway.UpdateMessageToUser(
                dto.MessageId,
                member.UserId,
                member.ChatId,
                chat.Content,
            );
        });

        return { message: 'successful' };
    }

    async GetStickerData() {
        try {
            const stickerPacks = [];
            const stickerFolderPath = path.join(
                __dirname,
                '../..',
                'static/stickers',
            );

            const stickerPacksFolder = fs.readdirSync(stickerFolderPath, {
                withFileTypes: true,
            });

            for (const pack of stickerPacksFolder) {
                const stickerPackPathForUser = path.join(
                    'static/stickers',
                    pack.name,
                );
                const newStickerPack: StickerPack = {
                    name: pack.name,
                    stickers: [],
                };

                const stickerPackFullPath = path.join(
                    stickerFolderPath,
                    newStickerPack.name,
                );
                const stickerFiles = fs.readdirSync(stickerPackFullPath, {
                    withFileTypes: true,
                });

                for (const file of stickerFiles) {
                    if (file.isFile()) {
                        const newSticker: Sticker = {
                            name: file.name,
                            pathforUser: path.join(
                                stickerPackPathForUser,
                                file.name,
                            ),
                        };
                        newStickerPack.stickers.push(newSticker);
                    }
                }

                stickerPacks.push(newStickerPack);
            }

            return stickerPacks;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async UpdateStickerDB() {
        const stickerPacks: StickerPack[] = await this.GetStickerData();

        this.prisma.$transaction(async () => {
            await this.prisma.stickers.deleteMany();
            await this.prisma.stickerGroup.deleteMany();

            for (const stickerPack of stickerPacks) {
                const newStickerGroup = await this.prisma.stickerGroup.create({
                    data: { GroupName: stickerPack.name },
                });

                for (const sticker of stickerPack.stickers) {
                    await this.prisma.stickers.create({
                        data: {
                            StickerGroupId: newStickerGroup.StickerGroupId,
                            StickerPath: sticker.pathforUser,
                        },
                    });
                }
            }
        });

        return { message: 'successful' };
    }

    async GetAllStickers() {
        return await this.prisma.stickerGroup.findMany({
            select: {
                StickerGroupId: true,
                GroupName: true,
                Stickers: {
                    select: {
                        StickerId: true,
                        StickerPath: true,
                    },
                },
            },
        });
    }

    private async GetChatMembers(chatId: number) {
        const chatMembers = await this.prisma.chats.findUnique({
            where: {
                ChatId: chatId,
            },
            select: {
                ChatMembers: {
                    select: {
                        UserId: true,
                        ChatId: true,
                    },
                },
            },
        });

        return chatMembers;
    }

    private async ValidateUserMessage(
        dto: DeleteMessageDto | UpdateMessageDto,
        userId: string,
    ) {
        const message = await this.prisma.messages.findUnique({
            where: {
                MessageId: dto.MessageId,
                SenderId: userId,
            },
            select: {
                MessageId: true,
            },
        });
        if (!message)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'you are not a sender of this message.',
            });
    }

    private async ValidateUpdateChatName(
        dto: UpdateChatNameDto,
        userId: string,
    ) {
        const member = { dto, userId };
        return member;
    }

    private async ValidateUpdateAvatar(userId: string, chatId: number) {
        const member = await this.prisma.chatMembers.findFirst({
            where: {
                UserId: userId,
                ChatId: chatId,
            },
            select: {
                Role: true,
            },
        });

        if (!member.Role)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'You are not a member of this chat',
            });

        if (member.Role > 3)
            throw new BadRequestException({
                error: true,
                show: true,
                message: "You don't have enough rights to upload an avatar",
            });
    }

    private async ValidateFixChat(dto: FixChatDto, userId: string) {
        const isFixed = await this.prisma.chatMembers.findUnique({
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
                show: true,
                message: 'you are not a member of this chat',
            });

        return isFixed.IsFixed;
    }

    private async ValidateDeleteMember(dto: DeleteMember, userId: string) {
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
                show: true,
                message: 'you are not a member of this chat',
            });

        if (!deletedMember)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'deleted user are not a member of this chat',
            });

        if (deletedMember.UserId === currentMember.UserId)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'You cannot delete yourself, try leave from chat',
            });

        if (currentMember.Role >= deletedMember.Role)
            throw new ForbiddenException({
                error: true,
                show: true,
                message: 'You cannot del user with role than <= your role',
            });

        return deletedMember.ChatMemberId;
    }

    private async ValidateAddMember(dto: AddMemberDto, userId: string) {
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
                show: true,
                message: 'You cannot grant roles larger than yours',
            });

        if (isNewMember)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'This user is already a member of the chat',
            });

        if (!isNewMemberExist)
            throw new ForbiddenException({
                error: true,
                show: true,
                message: 'This user does not exist',
            });
    }

    private async ValidateLeaveFromChat(dto: LeaveFromChatDto, userId: string) {
        const member = await this.prisma.chatMembers.findFirst({
            where: {
                ChatId: dto.chatId,
                UserId: userId,
            },
            select: {
                ChatId: true,
                ChatMemberId: true,
                Chat: {
                    select: {
                        IsGroup: true,
                    },
                },
            },
        });

        if (!member)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'you are not a member of this chat',
            });

        if (!member.Chat.IsGroup)
            throw new BadRequestException({
                error: true,
                message: 'you are not leave from personal chat.',
            });

        return member;
    }

    private async ValidateAddMessage(dto: NewMessageDto, userId: string) {
        const chatMember = await this.prisma.chatMembers.findFirst({
            where: {
                ChatId: dto.chatId,
                UserId: userId,
            },
            select: {
                Role: true,
            },
        });

        if (!chatMember.Role)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'You are not a member of this chat',
            });
    }
}
