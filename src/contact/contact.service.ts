import { Injectable } from '@nestjs/common';
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
        return userId;
    }

    async AddContactRequest(userId: string) {
        return userId;
    }

    async addContactResponse(userId: string) {
        return userId;
    }

    async CreateContact(userId: string) {
        return userId;
    }
}
