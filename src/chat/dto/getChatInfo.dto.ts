import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class GetChatInfoDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
