import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from './dto/chatMessage.dto';
import { PrismaService } from 'src/prisma.servise';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, string>();

    constructor(
        private readonly jwtService: JwtService,
        private prisma: PrismaService,
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

            console.log(secret);
            console.log(token);
            console.log(1);

            const payload = this.jwtService.verify(token, { secret });
            const userId = payload.userId;
            console.log(2 + ' ' + userId);

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

    async SendMessageToUser(message: ChatMessage, userId: string) {
        const socketId = this.connectedClients.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('NewMessage', message);
        }
    }
}
