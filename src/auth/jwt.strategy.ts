import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.servise';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req.cookies['accessToken'];
                },
            ]),
            ignoreExpiration: true, // set false to time tokens
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }
    async validate({ userId }: { userId: string }) {
        if (!userId) {
            throw new Error('Invalid token: userId is missing');
        }

        const user = await this.prisma.users.findUnique({
            where: { UserId: userId },
        });

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
