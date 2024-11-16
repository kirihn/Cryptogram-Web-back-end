import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';
import { UpdateNameDto } from './dto/updateName.dto';
import { UpdateUserNameDto } from './dto/updateUserName.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { UpdateLanguageDto } from './dto/updateLanguage.dto';
import { hash, verify } from 'argon2';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) {}

    async GetProfile(userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { UserId: userId },
        });

        return user;
    }

    async UpdateName(dto: UpdateNameDto, userId: string) {
        const user = await this.prisma.users.update({
            where: { UserId: userId },
            data: {
                Name: dto.name,
            },
        });

        return { newName: user.Name };
    }

    async UpdateUserName(dto: UpdateUserNameDto, userId: string) {
        const user = await this.prisma.users.update({
            where: { UserId: userId },
            data: {
                UserName: dto.username,
            },
        });

        return { newUsername: user.UserName };
    }

    async UpdateLanguage(dto: UpdateLanguageDto, userId: string) {
        const user = await this.prisma.users.update({
            where: { UserId: userId },
            data: {
                Language: dto.language,
            },
        });

        return user;
    }

    async UpdatePassword(dto: UpdatePasswordDto, userId: string) {
        await this.GetPasswordVerification(dto, userId);

        const user = await this.prisma.users.update({
            where: { UserId: userId },
            data: {
                PasswordHash: await hash(dto.password),
            },
        });

        return user;
    }

    async UpdateAvatar(file: Express.Multer.File, userId: string) {
        const newPath = '/uploads/avatars' + userId + '.png'; // добавить все проверки и расширение файла.
        const user = await this.prisma.users.update({
            where: { UserId: userId },
            data: {
                AvatarPath: newPath,
            },
        });

        return user;
    }

    async GetPasswordVerification(dto: UpdatePasswordDto, userId: string) {
        const userPasswordHash = await this.prisma.users.findUnique({
            where: {
                UserId: userId,
            },
            select: {
                PasswordHash: true,
            },
        });

        const isValid = await verify(
            userPasswordHash.PasswordHash,
            dto.oldPassword,
        );

        if (!isValid)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'invalid oldPassword',
            });

        if (dto.password !== dto.repeatPassword)
            throw new BadRequestException({
                error: true,
                show: true,
                message: "passwords don't match",
            });
    }
}
