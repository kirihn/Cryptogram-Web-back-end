import { BadRequestException, Injectable } from '@nestjs/common';
import { error } from 'console';
import { PrismaService } from 'src/prisma.servise';

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

    async AddContactResponse(userId: string) {
        return userId;
    }

    async CreateContact(userId: string) {
        return userId;
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
            await this.prisma.$transaction([
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
}
