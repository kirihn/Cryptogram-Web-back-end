import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.servise';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@prisma/client';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        await this.CheckUserExists(dto);

        if (dto.password != dto.repeatPassword)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'passwords must match',
            });

        const user = await this.prisma.users.create({
            data: {
                UserName: dto.username,
                Name: dto.name,
                Email: dto.email,
                PasswordHash: await hash(dto.password),
            },
        });

        const tokens = await this.IssueTokens(user.UserId);
        return {
            //user: this.ReturnUserFields(user),
            userId: user.UserId,
            ...tokens,
        };
    }

    async login(dto: AuthDto) {
        const user = await this.ValidateUser(dto);
        const tokens = await this.IssueTokens(user.UserId);
        return {
            //user: this.ReturnUserFields(user),
            userId: user.UserId,
            ...tokens,
        };
    }

    private async CheckUserExists(dto: RegisterDto) {
        const oldUser = await this.prisma.users.findFirst({
            where: {
                OR: [{ Email: dto.email }, { UserName: dto.username }],
            },
        });

        if (!oldUser) return;

        if (oldUser.Email === dto.email)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'Email alredy exist',
            });

        if (oldUser.UserName === dto.username)
            throw new BadRequestException({
                error: true,
                show: true,
                message: 'username alredy exist',
            });

        throw new BadRequestException({
            error: true,
            show: true,
            message: 'Such user alredy exist',
        });
    }

    private async IssueTokens(userId: string) {
        const data = { userId: userId };
        const accessToken = this.jwt.sign(data, {
            expiresIn: '1m',
        });
        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7d',
        });

        return { accessToken, refreshToken };
    }

    private ReturnUserFields(user: Users) {
        return {
            userId: user.UserId,
            email: user.Email,
            username: user.UserName,
        };
    }

    private async ValidateUser(dto: AuthDto) {
        const user = await this.prisma.users.findUnique({
            where: { Email: dto.email },
        });

        if (!user)
            throw new BadRequestException({
                error: true,
                message: 'this email is not registered',
            });

        const isValid = await verify(user.PasswordHash, dto.password);

        if (!isValid)
            throw new UnauthorizedException({
                error: true,
                show: true,
                message: 'invalid password',
            });

        return user;
    }
}
