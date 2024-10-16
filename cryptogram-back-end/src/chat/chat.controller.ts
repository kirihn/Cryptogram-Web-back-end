import {
    Controller,
    Get,
    Post,
    Body,
    Delete,
    ValidationPipe,
    UsePipes,
    HttpCode,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/createChat.dto';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { AddMemberDto } from './dto/addMember.dto';
import { CheckChatRole } from 'src/decorators/CheckChatRole.decorator';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Auth()
    @Post('createChat')
    async Create(
        @Body() dto: CreateChatDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.Create(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('AddMember')
    @CheckChatRole(1, 2, 3)
    @Auth()
    AddMember(
        @Body() dto: AddMemberDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.AddMember(dto, userId);
    }

    @Get('id')
    findOne() {
        return this.chatService.findOne(6);
    }

    @Delete('id')
    remove() {
        return this.chatService.remove(6);
    }
}
