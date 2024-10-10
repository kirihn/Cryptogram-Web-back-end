import {
    Body,
    Controller,
    Get,
    HttpCode,
    Put,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { UserIdDto } from './dto/userId.dto';
import { UpdateNameDto } from './dto/updateName.dto';
import { UpdateUserNameDto } from './dto/updateUserName.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @HttpCode(200)
    @Auth()
    @Get('getMyProfile')
    async GetMyProfile(@CurrentUser('UserId') userId: string) {
        return this.profileService.GetProfile(userId);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Auth()
    @Get('getUserProfile')
    async GetUserProfile(@Body() userId: UserIdDto) {
        return this.profileService.GetProfile(userId.userId);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Auth()
    @Put('updateName')
    async UpdateName(
        @Body() dto: UpdateNameDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdateName(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Auth()
    @Put('updateUserName')
    async UpdateUserName(
        @Body() dto: UpdateUserNameDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdateUserName(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Auth()
    @Put('updatePassword')
    async UpdatePassword(
        @Body() dto: UpdatePasswordDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.profileService.UpdatePassword(dto, userId);
    }
}
