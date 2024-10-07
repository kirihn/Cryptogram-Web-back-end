import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) {}
    async GetProfile(userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { UserId: userId },
        });

        return user;
    }
}
