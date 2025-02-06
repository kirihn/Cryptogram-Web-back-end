import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';
import { ContactRequestsStatus } from '@prisma/client';
import { CryptogramGateway } from 'src/webSocket/cryptogram.gateway';

import { AddContactResponseDto } from './dto/addContactResponse.dto';
import { DeleteContactAndChatDto } from './dto/deleteContactAndChat.dto';
import { DeleteContactRequestDto } from './dto/deleteContactRequest.dto';
import { AddContactRequestByUsernameDto } from './dto/addContactRequestByUsername.dto';

@Injectable()
export class ContactService {
    constructor(
        private prisma: PrismaService,
        private readonly wsGateway: CryptogramGateway,
    ) {}

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

        this.wsGateway.AddNewContactRequest(userRecipientId);
        this.wsGateway.AddNewContactRequest(userId);

        return { message: 'successful' };
    }

    async AddContactRequestByUsername(
        dto: AddContactRequestByUsernameDto,
        userId: string,
    ) {
        const userRecipient = await this.prisma.users.findUnique({
            where: { UserName: dto.username },
            select: {
                UserId: true,
            },
        });

        if (!userRecipient)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'User not found!',
            });

        return await this.AddContactRequest(userRecipient.UserId, userId);
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

            this.wsGateway.AddNewContact(newContact.UserId1);
            this.wsGateway.DeleteContactRequest(newContact.UserId1);
            this.wsGateway.AddUserToChat(newContact.UserId1);

            this.wsGateway.AddNewContact(newContact.UserId2);
            this.wsGateway.DeleteContactRequest(newContact.UserId2);
            this.wsGateway.AddUserToChat(newContact.UserId2);

            return { message: 'successful', status: 'accepted' };
        } else if (
            dto.NewContactRequestStatus === ContactRequestsStatus.blocked
        ) {
            await this.prisma.contactRequests.update({
                where: { ContactRequestId: dto.ContactRequestId },
                data: {
                    Status: ContactRequestsStatus.blocked,
                },
            });

            return { message: 'successful', status: 'blocked' };
        }
        throw new BadRequestException({
            error: true,
            show: false,
            message: 'Error in AddContactResponse!',
        });
    }

    async DeleteContactRequest(dto: DeleteContactRequestDto, userId: string) {
        await this.DeleteContactRequestValidation(dto, userId);

        const deletedRequest = await this.prisma.contactRequests.delete({
            where: { ContactRequestId: dto.ContactRequestId },
            select: {
                UserRecipientId: true,
                UserSenderId: true,
            },
        });

        this.wsGateway.DeleteContactRequest(deletedRequest.UserRecipientId);
        this.wsGateway.DeleteContactRequest(deletedRequest.UserSenderId);

        return { message: 'successful' };
    }

    async DeleteContactAndChat(dto: DeleteContactAndChatDto, userId: string) {
        await this.DeleteContactAndChatValidation(dto, userId);

        const chat = await this.prisma.$transaction(async (prisma) => {
            const chat = await prisma.contacts.delete({
                where: { ContactId: dto.ContactId },
                select: {
                    ChatId: true,
                    UserId1: true,
                    UserId2: true,
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

            return chat;
        });

        this.wsGateway.DeleteContact(chat.UserId1);
        this.wsGateway.DeleteUserFromChat(chat.UserId1, chat.ChatId);

        this.wsGateway.DeleteContact(chat.UserId2);
        this.wsGateway.DeleteUserFromChat(chat.UserId2, chat.ChatId);

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

    private async DeleteContactRequestValidation(
        dto: DeleteContactRequestDto,
        userId: string,
    ) {
        const contactRequest = await this.prisma.contactRequests.findUnique({
            where: { ContactRequestId: dto.ContactRequestId },
            select: {
                UserSenderId: true,
            },
        });

        if (contactRequest.UserSenderId !== userId)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'It isnt your contact request!',
            });
    }
}
