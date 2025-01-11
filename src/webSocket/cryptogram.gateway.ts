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

    private connectedClients = new Map<string, string>();

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

            this.connectedClients.set(userId, client.id);
        } catch (error) {
            client.disconnect();
            console.log('ConnectError - ' + error);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = [...this.connectedClients.entries()].find(
            ([, socketId]) => socketId === client.id,
        )?.[0];

        if (userId) {
            this.connectedClients.delete(userId);
        }
    }

    async AddUserToChat(userId: string) {
        const socketId = this.connectedClients.get(userId);

        if (socketId) {
            this.server
                .to(socketId)
                .emit('addUserToChat', { message: 'updateChatPanel' });
        }
    }

    async DeleteUserFromChat(userId: string, deletedChatId: number) {
        const socketId = this.connectedClients.get(userId);

        if (socketId) {
            this.server.to(socketId).emit('deleteUserFromChat', {
                message: 'updateChatPanel',
                deletedChatId,
            });
        }
    }

    async SendMessageToUser(
        message: ChatMessage,
        userId: string,
        chatId: number,
    ) {
        const socketId = this.connectedClients.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('NewMessage', { message, chatId });
        }
    }

    async DeleteMessageToUser(
        deletedMessageId: number,
        userId: string,
        chatId: number,
    ) {
        const socketId = this.connectedClients.get(userId);
        if (socketId) {
            this.server
                .to(socketId)
                .emit('DeleteMessage', { deletedMessageId, chatId });
        }
    }

    async UpdateMessageToUser(
        updatedMessageId: number,
        userId: string,
        chatId: number,
        newContent: string,
    ) {
        const socketId = this.connectedClients.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('UpdateMessage', {
                updatedMessageId,
                chatId,
                newContent,
            });
        }
    }
}
