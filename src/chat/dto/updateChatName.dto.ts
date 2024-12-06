import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class UpdateChatNameDto {
    @IsString()
    @IsNotEmpty({ message: 'The chatName must not be empty' })
    chatName: string;

    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
