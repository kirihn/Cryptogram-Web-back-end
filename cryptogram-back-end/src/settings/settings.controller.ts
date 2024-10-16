import {
    Body,
    Controller,
    Get,
    Put,
    UploadedFile,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { UpdateNameDto } from './dto/updateName.dto';
import { UpdateUserNameDto } from './dto/updateUserName.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { UpdateLanguageDto } from './dto/updateLanguage.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('settings')
export class SettingsController {
    constructor(private readonly profileService: SettingsService) {}

    @Auth()
    @Get('getMyProfile')
    async GetMyProfile(@CurrentUser('UserId') userId: string) {
        return this.profileService.GetProfile(userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Put('updateName')
    async UpdateName(
        @Body() dto: UpdateNameDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdateName(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Put('updateUserName')
    async UpdateUserName(
        @Body() dto: UpdateUserNameDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdateUserName(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Put('updateLanguage')
    async UpdateLanguage(
        @Body() dto: UpdateLanguageDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdateLanguage(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Put('updatePassword')
    async UpdatePassword(
        @Body() dto: UpdatePasswordDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdatePassword(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Put('updateAvatar')
    @UseInterceptors(FileInterceptor('Avatar'))
    async UpdateAvatar(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdateAvatar(file, userId);
    }
}
