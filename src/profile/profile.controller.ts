import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    UploadedFile,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/pipes/FileValidation.pipe';

import { ProfileService } from './profile.service';
import { UpdateNameDto } from './dto/updateName.dto';
import { UpdateUserNameDto } from './dto/updateUserName.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { UpdateLanguageDto } from './dto/updateLanguage.dto';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

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
    @Put('updateUsername')
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
    @Post('uploadAvatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async UpdateAvatar(
        @UploadedFile(new FileValidationPipe(1000, /\.(jpg|jpeg|png|gif)$/i))
        file: Express.Multer.File,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdateAvatar(file, userId);
    }
}
