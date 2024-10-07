import {
    Controller,
    HttpCode,
    Post,
    UsePipes,
    ValidationPipe,
    Body,
    Res,
    Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthDto } from './dto/auth.dto';
import { Response } from 'express';
import { Auth } from 'src/decorators/auth.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UsePipes(new ValidationPipe())
    @Post('register')
    @HttpCode(200)
    async Register(@Body() dto: RegisterDto, @Res() res: Response) {
        const { accessToken, refreshToken, user } =
            await this.authService.register(dto);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, // Рекомендуется для HTTPS
            sameSite: 'strict', // Защита от CSRF
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
        });

        return res.send(user);
    }

    @UsePipes(new ValidationPipe())
    @Post('login')
    @HttpCode(200)
    async Login(@Body() dto: AuthDto, @Res() res: Response) {
        const { accessToken, refreshToken, user } =
            await this.authService.login(dto);

        res.cookie('accessToken', accessToken, {
            httpOnly: false,
            secure: false, // Рекомендуется для HTTPS
            sameSite: 'strict', // Защита от CSRF
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: false,
            secure: false,
            sameSite: 'strict',
        });

        return res.send(user);
    }

    @Auth()
    @Get('testAuth')
    @HttpCode(200)
    async TestAuth() {
        return 'successfull';
    }
}
