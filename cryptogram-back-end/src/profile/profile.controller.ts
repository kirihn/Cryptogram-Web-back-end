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
    @Put(updateProfile)
    async(@Body() userData: UpdateProfileDto)
}
