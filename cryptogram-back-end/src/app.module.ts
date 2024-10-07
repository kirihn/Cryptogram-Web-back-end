import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.servise';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';

@Module({
    imports: [AuthModule, ConfigModule.forRoot(), ProfileModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
