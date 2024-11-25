import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from './dto/chatNewMessage.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, string>();

    constructor(private readonly jwtService: JwtService) {}

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.query.token as string;
            const payload = this.jwtService.verify(token);
            const userId = payload.userId;

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

    sendMessageToUser(userId: string, newMessage: ChatMessage) {
        const socketId = this.connectedClients.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('receiveMessage', newMessage);
        }
    }
}
