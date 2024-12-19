import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateMessageDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty({ message: 'The messageId must not be empty' })
    MessageId: number;

    @ApiProperty()
    @IsString()
    @MinLength(1, {
        message: 'message must be 1 least characters long',
    })
    @ApiProperty()
    @MaxLength(499, {
        message: 'message must be 499 least characters short',
    })
    newContent: string;
}
