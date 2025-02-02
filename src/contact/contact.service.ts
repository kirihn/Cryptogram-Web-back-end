import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';
import { ContactRequestsStatus } from '@prisma/client';

import { AddContactResponseDto } from './dto/addContactResponse.dto';
import { DeleteContactAndChatDto } from './dto/deleteContactAndChat.dto';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaService) {}

    async GetMyContacts(userId: string) {
        const contacts = await this.prisma.users.findUnique({
            where: {
                UserId: userId,
            },
            select: {
                ContactsWhenOwnerAsUser1: {
                    include: {
                        User2: {
                            select: {
                                UserId: true,
                                Name: true,
                                AvatarPath: true,
                                UserName: true,
                                Email: true,
                            },
                        },
                    },
                },
                ContactsWhenOwnerAsUser2: {
                    include: {
                        User1: {
                            select: {
                                UserId: true,
                                Name: true,
                                AvatarPath: true,
                                UserName: true,
                                Email: true,
                            },
                        },
                    },
                },
            },
        });

        const allContacts = [
            ...contacts.ContactsWhenOwnerAsUser1.map((contact) => ({
                ContactId: contact.ContactId,
                ChatId: contact.ChatId,
                CreatedAt: contact.CreatedAt,
                UpdatedAt: contact.UpdatedAt,
                ContactUser: contact.User2,
            })),
            ...contacts.ContactsWhenOwnerAsUser2.map((contact) => ({
                ContactId: contact.ContactId,
                ChatId: contact.ChatId,
                CreatedAt: contact.CreatedAt,
                UpdatedAt: contact.UpdatedAt,
                ContactUser: contact.User1,
            })),
        ];
        return allContacts;
    }

    async GetMyContactsRequest(userId: string) {
        const contactsRequests = await this.prisma.users.findUnique({
            where: { UserId: userId },
            select: {
                SentContactRequests: {
                    select: {
                        ContactRequestId: true,
                        CreatedAt: true,
                        Status: true,
                        UserRecipient: {
                            select: {
                                UserId: true,
                                Name: true,
                                AvatarPath: true,
                                UserName: true,
                                Email: true,
                            },
                        },
                    },
                },
                ReceivedContactRequests: {
                    select: {
                        ContactRequestId: true,
                        CreatedAt: true,
                        Status: true,
                        UserSender: {
                            select: {
                                UserId: true,
                                Name: true,
                                AvatarPath: true,
                                UserName: true,
                                Email: true,
                            },
                        },
                    },
                },
            },
        });

        return contactsRequests;
    }

    async AddContactRequest(userRecipientId: string, userId: string) {
        await this.AddContactRequestValidation(userRecipientId, userId);
        await this.prisma.contactRequests.create({
            data: {
                UserSenderId: userId,
                UserRecipientId: userRecipientId,
            },
        });

        return { message: 'successful' };
    }

    async AddContactResponse(dto: AddContactResponseDto, userId: string) {
        await this.AddContactResponseValidation(dto, userId);

        if (dto.NewContactRequestStatus === ContactRequestsStatus.accepted) {
            const newContact = await this.prisma.$transaction(
                async (prisma) => {
                    const contactRequest = await prisma.contactRequests.delete({
                        where: { ContactRequestId: dto.ContactRequestId },
                        select: {
                            UserRecipientId: true,
                            UserSenderId: true,
                        },
                    });
                    const chat = await prisma.chats.create({
                        data: {
                            ChatName: 'Personal Chat',
                            IsGroup: false,
                            KeyHash: 'none',
                        },
                    });
                    await prisma.chatMembers.create({
                        data: {
                            UserId: contactRequest.UserRecipientId,
                            ChatId: chat.ChatId,
                            Role: 4,
                        },
                    });
                    await prisma.chatMembers.create({
                        data: {
                            UserId: contactRequest.UserSenderId,
                            ChatId: chat.ChatId,
                            Role: 4,
                        },
                    });

                    const contact = await prisma.contacts.create({
                        data: {
                            UserId1: contactRequest.UserRecipientId,
                            UserId2: contactRequest.UserSenderId,
                            ChatId: chat.ChatId,
                        },
                    });
                    return contact;
                },
            );
            return newContact;
        } else if (
            dto.NewContactRequestStatus === ContactRequestsStatus.blocked
        ) {
            const updatedContactRequest =
                await this.prisma.contactRequests.update({
                    where: { ContactRequestId: dto.ContactRequestId },
                    data: {
                        Status: ContactRequestsStatus.blocked,
                    },
                });

            return updatedContactRequest;
        }
        return userId;
    }

    async DeleteContactAndChat(dto: DeleteContactAndChatDto, userId: string) {
        await this.DeleteContactAndChatValidation(dto, userId);

        await this.prisma.$transaction(async (prisma) => {
            const chat = await prisma.contacts.delete({
                where: { ContactId: dto.ContactId },
                select: {
                    ChatId: true,
                },
            });

            await prisma.messages.deleteMany({
                where: { ChatId: chat.ChatId },
            });
            await prisma.chatMembers.deleteMany({
                where: { ChatId: chat.ChatId },
            });
            await prisma.chats.delete({
                where: { ChatId: chat.ChatId },
                include: {
                    ChatMessages: true,
                    ChatMembers: true,
                },
            });
        });

        return { message: 'successful' };
    }

    private async AddContactRequestValidation(
        userRecipientId: string,
        userId: string,
    ) {
        if (userId === userRecipientId)
            throw new BadRequestException({
                error: true,
                show: true,
                message: "you can't send a request to yourself!",
            });

        const [UserRecipient, ContactExist, ContactRequestExist] =
            await Promise.all([
                this.prisma.users.findUnique({
                    where: { UserId: userRecipientId },
                    select: {
                        UserId: true,
                    },
                }),
                this.prisma.contacts.findFirst({
                    where: {
                        OR: [
                            { UserId1: userId, UserId2: userRecipientId },
                            { UserId1: userRecipientId, UserId2: userId },
                        ],
                    },
                    select: {
                        ContactId: true,
                    },
                }),
                this.prisma.contactRequests.findFirst({
                    where: {
                        OR: [
                            {
                                UserSenderId: userId,
                                UserRecipientId: userRecipientId,
                            },
                            {
                                UserSenderId: userRecipientId,
                                UserRecipientId: userId,
                            },
                        ],
                    },
                }),
            ]);

        if (!UserRecipient)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'The user not found!',
            });

        if (ContactExist)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'This user is already your contact!',
            });

        if (ContactRequestExist && ContactRequestExist.UserSenderId === userId)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'You have already sent a request to this user!',
            });

        if (
            ContactRequestExist &&
            ContactRequestExist.UserSenderId === userRecipientId
        )
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'This user has already sent you a request!',
            });
    }

    private async AddContactResponseValidation(
        dto: AddContactResponseDto,
        userId: string,
    ) {
        if (dto.NewContactRequestStatus === ContactRequestsStatus.pending)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'you cannot set the status as pending!',
            });

        const ContactRequest = await this.prisma.contactRequests.findUnique({
            where: { ContactRequestId: dto.ContactRequestId },
            select: {
                UserRecipientId: true,
            },
        });

        if (!ContactRequest)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'The request was not found!',
            });

        if (ContactRequest.UserRecipientId !== userId)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'You are not the recipient of this request!',
            });
    }

    private async DeleteContactAndChatValidation(
        dto: DeleteContactAndChatDto,
        userId: string,
    ) {
        const contact = await this.prisma.contacts.findUnique({
            where: { ContactId: dto.ContactId },
            select: {
                UserId1: true,
                UserId2: true,
            },
        });

        if (userId !== contact.UserId1 && userId !== contact.UserId2)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'You are not contacts!',
            });
    }
}
