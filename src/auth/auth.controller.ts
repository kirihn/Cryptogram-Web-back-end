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
import { Response } from 'express';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import { AuthDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Register in the app' })
    @ApiBody({ type: RegisterDto })
    @UsePipes(new ValidationPipe())
    @Post('register')
    @HttpCode(200)
    async Register(@Body() dto: RegisterDto, @Res() res: Response) {
        const { accessToken, refreshToken, wsToken, userId } =
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

        return res.send({ message: 'successful', myUserId: userId, wsToken });
    }

    @ApiOperation({ summary: 'Login in the app' })
    @ApiBody({ type: AuthDto })
    @UsePipes(new ValidationPipe())
    @Post('login')
    @HttpCode(200)
    async Login(@Body() dto: AuthDto, @Res() res: Response) {
        const { accessToken, refreshToken, wsToken, userId } =
            await this.authService.login(dto);

        res.cookie('accessToken', accessToken, {
            httpOnly: false,
            secure: false, // Рекомендуется для HTTPS
            sameSite: 'strict', // Защита от CSRF
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: false,
            secure: false, // Рекомендуется для HTTPS
            sameSite: 'strict', // Защита от CSRF
        });

        return res.send({ message: 'successful', myUserId: userId, wsToken });
    }

    @ApiOperation({ summary: 'logout in the app' })
    @Post('/logout')
    @HttpCode(200)
    async Logout(@Res() res: Response) {
        res.cookie('accessToken', '', {
            httpOnly: false,
            secure: false, // Рекомендуется для HTTPS
            sameSite: 'strict', // Защита от CSRF
        });

        res.cookie('refreshToken', '', {
            httpOnly: false,
            secure: false, // Рекомендуется для HTTPS
            sameSite: 'strict', // Защита от CSRF
        });

        return res.send({ message: 'Logout successfully' });
    }

    @ApiOperation({ summary: 'check auth in the app' })
    @UsePipes(new ValidationPipe())
    @Get('/testAuth')
    @Auth()
    async TestAuth(@CurrentUser('Email') email: string) {
        return 'you are auth - ' + email;
    }
}
