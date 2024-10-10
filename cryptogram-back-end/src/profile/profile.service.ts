import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';
import { UpdateNameDto } from './dto/updateName.dto';
import { UpdateUserNameDto } from './dto/updateUserName.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) {}
    async GetProfile(userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { UserId: userId },
        });

        return user;
    }

    async UpdateName(dto: UpdateNameDto, userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { UserId: userId },
        });

        return user;
    }

    async UpdateUserName(dto: UpdateUserNameDto, userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { UserId: userId },
        });

        return user;
    }

    async UpdatePassword(dto: UpdatePasswordDto, userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { UserId: userId },
        });

        return user;
    }
}
