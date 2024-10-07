import { Injectable } from '@nestjs/common';
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
            //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req.cookies['accessToken'];
                },
            ]),
            ignoreExpiration: true,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }
    async validate({ userId }: { userId: string }) {
        if (!userId) {
            throw new Error('Invalid token: userId is missing');
        }

        return this.prisma.users.findUnique({ where: { UserId: userId } });
    }
}
