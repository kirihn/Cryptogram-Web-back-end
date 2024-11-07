import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.servise';
// сделать свою дтошку с опциональными полями
@Injectable()
export class ChatRoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<number[]>(
            'roles',
            context.getHandler(),
        );
        if (!roles) return true;

        const request = context.switchToHttp().getRequest();

        const user = request.user;
        const userId: string = user.UserId;

        const chatId = request.body.chatId;

        if (!chatId || !user)
            throw new ForbiddenException({
                error: true,
                message: 'user or chatId is missing',
            });

        const memberRole = await this.prisma.chatMembers.findFirst({
            where: {
                UserId: userId,
                ChatId: chatId,
            },
            select: {
                Role: true,
            },
        });

        if (!memberRole) {
            throw new ForbiddenException({
                error: true,
                message: 'You are not a member of this chat',
            });
        }

        const hasRole = roles.includes(memberRole.Role);

        if (!hasRole) {
            throw new ForbiddenException({
                error: true,
                message:
                    'You do not have the required role to perform this action',
            });
        }

        return true;
    }
}
