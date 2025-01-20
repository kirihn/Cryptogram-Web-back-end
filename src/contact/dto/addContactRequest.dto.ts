import { IsString } from 'class-validator';

export class AddContactRequestsParamDto {
    @IsString()
    UserRecipientId: string;
}
