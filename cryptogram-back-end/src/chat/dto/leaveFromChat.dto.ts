import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class LeaveFromChatDto {
    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
