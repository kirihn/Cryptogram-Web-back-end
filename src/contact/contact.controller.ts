import {
    Controller,
    Get,
    Param,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/currentUser.decorator';

import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Auth()
    @Get('getMyContacts')
    async GetMyContacts(@CurrentUser('UserId') userId: string) {
        return this.contactService.GetMyContacts(userId);
    }

    @Auth()
    @Get('getMycontactRequests')
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

    // async addContactResponse(userId: string) {
    //     return userId;
    // }

    // async CreateContact(userId: string) {
    //     return userId;
    // }
}
