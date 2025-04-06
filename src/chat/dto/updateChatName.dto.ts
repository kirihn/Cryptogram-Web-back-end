import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

export class UpdateChatNameDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'The chatName must not be empty' })
    @MaxLength(20, { message: 'Max length of chatname is 20 charachters' })
    chatName: string;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
