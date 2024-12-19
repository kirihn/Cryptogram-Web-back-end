import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteMessageDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty({ message: 'The messageId must not be empty' })
    MessageId: number;
}
