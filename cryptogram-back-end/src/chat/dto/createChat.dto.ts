import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
    @IsString()
    @IsNotEmpty({ message: 'The chatName must not be empty' })
    chatName: string;

    @IsBoolean()
    isGroup: boolean;

    @IsString()
    @IsNotEmpty()
    keyHash: string;
}
