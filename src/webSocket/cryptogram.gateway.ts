import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

import { ChatMessage } from '../chat/dto/chatMessage.dto';

@WebSocketGateway({ cors: true })
export class CryptogramGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, Set<string>>();

    constructor(
        private readonly jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.query.token as string;

            if (!token) {
                throw new Error('Token not provided');
            }

            const secret = this.configService.get('JWT_SECRET');

            if (!secret) {
                throw new Error('JWT_SECRET is not defined');
            }

            const payload = this.jwtService.verify(token, { secret });
            const userId = payload.userId;

            if (!userId) {
                throw new Error('Invalid token payload');
            }

            if (this.connectedClients.has(userId)) {
                this.connectedClients.get(userId)?.add(client.id);
            } else {
                this.connectedClients.set(userId, new Set());
            }
        } catch (error) {
            client.disconnect();
            console.log('WS Connect Error - ' + error);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = [...this.connectedClients.entries()].find(
            ([, socketIds]) => socketIds.has(client.id),
        )?.[0];

        if (userId) {
            this.connectedClients.get(userId)?.delete(client.id);

            if (this.connectedClients.get(userId)?.size === 0) {
                this.connectedClients.delete(userId);
            }
        }
    }

    async SendSignal(userId: string, message: string, body?: any) {
        const socketIdSet = this.connectedClients.get(userId);

        socketIdSet.forEach((socketId) => {
            if (socketId) {
                this.server.to(socketId).emit(message, body);
            }
        });
    }

    async AddUserToChat(userId: string) {
        this.SendSignal(userId, 'addUserToChat', {
            message: 'updateChatPanel',
        });
    }

    async DeleteUserFromChat(userId: string, deletedChatId: number) {
        this.SendSignal(userId, 'deleteUserFromChat', {
            message: 'updateChatPanel',
            deletedChatId,
        });

        // if (socketId) {
        //     this.server.to(socketId).emit('deleteUserFromChat', {
        //         message: 'updateChatPanel',
        //         deletedChatId,
        //     });
        // }
    }

    async SendMessageToUser(
        message: ChatMessage,
        userId: string,
        chatId: number,
    ) {
        this.SendSignal(userId, 'NewMessage', { message, chatId });

        // if (socketId) {
        //     this.server.to(socketId).emit('NewMessage', { message, chatId });
        // }
    }

    async DeleteMessageToUser(
        deletedMessageId: number,
        userId: string,
        chatId: number,
    ) {
        this.SendSignal(userId, 'DeleteMessage', { deletedMessageId, chatId });

        // if (socketId) {
        //     this.server
        //         .to(socketId)
        //         .emit('DeleteMessage', { deletedMessageId, chatId });
        // }
    }

    async UpdateMessageToUser(
        updatedMessageId: number,
        userId: string,
        chatId: number,
        newContent: string,
    ) {
        this.SendSignal(userId, 'UpdateMessage', {
            updatedMessageId,
            chatId,
            newContent,
        });

        // if (socketId) {
        //     this.server.to(socketId).emit('UpdateMessage', {
        //         updatedMessageId,
        //         chatId,
        //         newContent,
        //     });
        // }
    }

    async AddNewContact(userId: string) {
        this.SendSignal(userId, 'addNewContact');

        // if (socketId) this.server.to(socketId).emit('addNewContact');
    }

    async DeleteContact(userId: string) {
        this.SendSignal(userId, 'deleteContact');

        // if (socketId) this.server.to(socketId).emit('deleteContact');
    }

    async AddNewContactRequest(userId: string) {
        this.SendSignal(userId, 'addNewContactRequest');

        // if (socketId) this.server.to(socketId).emit('addNewContactRequest');
    }

    async DeleteContactRequest(userId: string) {
        this.SendSignal(userId, 'deleteContactRequest');

        // if (socketId) this.server.to(socketId).emit('deleteContactRequest');
    }

    async ChangeStatusContactRequest(userId: string) {
        this.SendSignal(userId, 'changeStatusContactRequest');

        // if (socketId)
        //     this.server.to(socketId).emit('changeStatusContactRequest');
    }
}
