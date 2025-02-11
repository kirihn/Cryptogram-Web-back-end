import {
    Controller,
    Post,
    Body,
    ValidationPipe,
    UsePipes,
    Get,
    Put,
    UseInterceptors,
    UploadedFile,
    Query,
    Delete,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { CheckChatRole } from 'src/decorators/checkChatRole.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/pipes/FileValidation.pipe';

import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/createChat.dto';
import { AddMemberDto } from './dto/addMember.dto';
import { DeleteMember } from './dto/deleteMember.dto';
import { FixChatDto } from './dto/fixChat.dto';
import { GetChatInfoDto } from './dto/getChatInfo.dto';
import { LeaveFromChatDto } from './dto/leaveFromChat.dto';
import { NewMessageDto } from './dto/chatMessage.dto';
import { UpdateChatNameDto } from './dto/updateChatName.dto';
import { DeleteMessageDto } from './dto/deleteMessage.dto';
import { UpdateMessageDto } from './dto/updateMessage.dto';

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
    async AddMember(
        @Body() dto: AddMemberDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.AddMember(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Put('deleteMember')
    @CheckChatRole(1, 2)
    @Auth()
    async DeleteMember(
        @Body() dto: DeleteMember,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.DeleteMember(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Post('leaveFromChat')
    @Auth()
    async LeaveFromChat(
        @Body() dto: LeaveFromChatDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.LeaveFromChat(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Post('leaveFromChat')
    @Auth()
    async ExcludeFromChat(
        @Body() dto: LeaveFromChatDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.LeaveFromChat(dto, userId);
    }

    @Get('getMyChatsList')
    @Auth()
    async GetMyChats(@CurrentUser('UserId') userId: string) {
        return this.chatService.GetMyChats(userId);
    }

    @UsePipes(new ValidationPipe())
    @Put('fixChat')
    @Auth()
    async FixChat(
        @Body() dto: FixChatDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.FixChat(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Post('GetChatInfo')
    @Auth()
    async GetChatInfo(
        @Body() dto: GetChatInfoDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.GetChatInfo(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Post('sendMessage')
    @CheckChatRole(1, 2, 3, 4)
    @Auth()
    async AddMessage(
        @CurrentUser('UserId') userId: string,
        @Body() dto: NewMessageDto,
    ) {
        return this.chatService.AddMessage(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Post('uploadAvatar')
    @Auth()
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

    @UsePipes(new ValidationPipe())
    @Put('updateChatName')
    @CheckChatRole(1, 2, 3)
    @Auth()
    UpdateChatName(@Body() dto: UpdateChatNameDto) {
        return this.chatService.UpdateChatName(dto);
    }

    @UsePipes(new ValidationPipe())
    @Delete('deleteMessage')
    @Auth()
    async DeleteMessage(
        @Body() dto: DeleteMessageDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.DeleteMessage(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Put('updateMessage')
    @Auth()
    async UpdateMessage(
        @Body() dto: UpdateMessageDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.chatService.UpdateMessage(dto, userId);
    }

    /////////////////// time func
    @Get('updateStickerDB')
    @Auth()
    async UpdateStickerDB() {
        return this.chatService.UpdateStickerDB();
    }
}
