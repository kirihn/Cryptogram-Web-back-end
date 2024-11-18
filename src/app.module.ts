import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.servise';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from './settings/profile.module';
import { ChatModule } from './chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'),
        }),
        AuthModule,
        ConfigModule.forRoot(),
        SettingsModule,
        ChatModule,
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
