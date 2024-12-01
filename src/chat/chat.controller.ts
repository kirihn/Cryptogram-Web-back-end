import {
    Controller,
    Post,
    Body,
    Delete,
    ValidationPipe,
    UsePipes,
    Get,
    Put,
    UseInterceptors,
    UploadedFile,
    Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/createChat.dto';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { AddMemberDto } from './dto/addMember.dto';
import { CheckChatRole } from 'src/decorators/CheckChatRole.decorator';
import { DeleteMember } from './dto/deleteMember.dto';
import { FixChatDto } from './dto/fixChat.dto';
import { GetChatInfoDto } from './dto/getChatInfo.dto';
import { LeaveFromChatDto } from './dto/leaveFromChat.dto';
import { NewMessageDto } from './dto/chatMessage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/pipes/FileValidation.pipe';

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
        return this.chatService.CreateChat(dto, userId);
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

    @UsePipes(new ValidationPipe())
    @Delete('leaveFromChat')
    @Auth()
    LeaveFromChat(
        @Body() dto: LeaveFromChatDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.LeaveFromChat(dto, userId);
    }

    @Get('getMyChatsList')
    @Auth()
    GetMyChats(@CurrentUser('UserId') userId: string) {
        return this.chatService.GetMyChats(userId);
    }

    @UsePipes(new ValidationPipe())
    @Put('fixChat')
    @Auth()
    FixChat(@Body() dto: FixChatDto, @CurrentUser('UserId') userId: string) {
        return this.chatService.FixChat(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Post('GetChatInfo')
    @Auth()
    GetChatInfo(
        @Body() dto: GetChatInfoDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.GetChatInfo(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Post('sendMessage')
    @CheckChatRole(1, 2, 3, 4)
    @Auth()
    AddMessage(
        @CurrentUser('UserId') userId: string,
        @Body() dto: NewMessageDto,
    ) {
        return this.chatService.AddMessage(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Post('uploadAvatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async UpdateAvatar(
        @UploadedFile(new FileValidationPipe(1000, /\.(jpg|jpeg|png|gif)$/i))
        file: Express.Multer.File,
        @CurrentUser('UserId') userId: string,
        @Query('chatId', new ValidationPipe({ transform: true }))
        chatId: number,
    ) {
        return this.chatService.UpdateAvatar(file, userId, chatId);
    }
}
