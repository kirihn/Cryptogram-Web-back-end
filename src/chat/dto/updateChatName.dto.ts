import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class UpdateChatNameDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'The chatName must not be empty' })
    chatName: string;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
