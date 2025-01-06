import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma.servise';

@Injectable()
export class AppService {
    constructor(private prisma: PrismaService) {}
    async getHello() {
        // const user = await this.prisma.users.create({
        //     data: {
        //         Login: 'kirihn',
        //         PasswordHash: await hash('2384'),
        //         Email: 'kzykov03@mail.ru',
        //         UserName: 'Кирилл',
        //     },
        // });
        return 'Hello world';
    }
}
