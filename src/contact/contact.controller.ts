import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/currentUser.decorator';

import { ContactService } from './contact.service';
import { AddContactResponseDto } from './dto/addContactResponse.dto';
import { DeleteContactAndChatDto } from './dto/deleteContactAndChat.dto';
import { DeleteContactRequestDto } from './dto/deleteContactRequest.dto';
import { AddContactRequestByUsernameDto } from './dto/addContactRequestByUsername.dto';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Auth()
    @Get('getMyContacts')
    async GetMyContacts(@CurrentUser('UserId') userId: string) {
        return this.contactService.GetMyContacts(userId);
    }

    @Auth()
    @Get('getMyContactRequests')
    async GetMyContactsRequest(@CurrentUser('UserId') userId: string) {
        return this.contactService.GetMyContactsRequest(userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Post('addContactRequest/:UserRecipientId')
    async AddContactRequest(
        @Param('UserRecipientId') userRecipientId: string,
        @CurrentUser('UserId')
        userId: string,
    ) {
        return this.contactService.AddContactRequest(userRecipientId, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Post('addContactRequestByUsername')
    async AddContactRequestByUsername(
        @Body() dto: AddContactRequestByUsernameDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.contactService.AddContactRequestByUsername(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Put('addContactResponse')
    async AddContactResponse(
        @Body() dto: AddContactResponseDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.contactService.AddContactResponse(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Put('deleteContactRequest')
    async DeleteContactRequest(
        @Body() dto: DeleteContactRequestDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.contactService.DeleteContactRequest(dto, userId);
    }

    @UsePipes(new ValidationPipe())
    @Auth()
    @Delete('deleteContactAndChat')
    async DeleteContactAndChat(
        @Body() dto: DeleteContactAndChatDto,
        @CurrentUser('UserId') userId: string,
    ) {
        return this.contactService.DeleteContactAndChat(dto, userId);
    }
}
