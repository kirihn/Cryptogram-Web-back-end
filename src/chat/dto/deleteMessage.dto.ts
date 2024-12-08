import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteMessageDto {
    @IsInt()
    @IsNotEmpty({ message: 'The messageId must not be empty' })
    MessageId: number;
}
