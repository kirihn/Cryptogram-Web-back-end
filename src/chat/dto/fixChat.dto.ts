import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class FixChatDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty({ message: 'The chatMemberId must not be empty' })
    @IsPositive()
    chatMemberId: number;
}
