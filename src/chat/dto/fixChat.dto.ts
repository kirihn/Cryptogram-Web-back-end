import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class FixChatDto {
    @IsInt()
    @IsNotEmpty({ message: 'The chatMemberId must not be empty' })
    @IsPositive()
    chatMemberId: number;
}
