import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.servise';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from './settings/settings.module';

@Module({
    imports: [AuthModule, ConfigModule.forRoot(), SettingsModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
