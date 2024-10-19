import {
    Controller,
    Post,
    Body,
    Delete,
    ValidationPipe,
    UsePipes,
    Get,
    Put,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/createChat.dto';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { AddMemberDto } from './dto/addMember.dto';
import { CheckChatRole } from 'src/decorators/CheckChatRole.decorator';
import { DeleteMember } from './dto/deleteMember.dto';
import { FixChatDto } from './dto/fixChat.dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @UsePipes(new ValidationPipe())
    @Auth()
    @Post('createChat')
    async Create(
        @Body() dto: CreateChatDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.Create(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Post('AddMember')
    @CheckChatRole(1, 2, 3)
    @Auth()
    AddMember(
        @Body() dto: AddMemberDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.AddMember(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Delete('deleteMember')
    @CheckChatRole(1, 2)
    @Auth()
    DeleteMember(
        @Body() dto: DeleteMember,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.DeleteMember(dto, userId);
    }

    @Get('getMyChats')
    @Auth()
    GetMyChats(@CurrentUser('UserId') userId: string) {
        return this.chatService.GetMyChats(userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Put('fixChat')
    FixChat(@Body() dto: FixChatDto, @CurrentUser('UserId') userId: string) {
        return this.chatService.FixChat(dto, userId);
    }
}
