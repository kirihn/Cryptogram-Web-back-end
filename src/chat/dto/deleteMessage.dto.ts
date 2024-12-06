import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteMessageDto {
    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    MessageId: number;
}
