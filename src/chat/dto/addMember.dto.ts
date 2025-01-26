import { ApiProperty } from '@nestjs/swagger';
import {
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    Matches,
} from 'class-validator';

export class AddMemberDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'The username must not be empty' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message:
            'The user name can contain only English letters, numbers, and underscores',
    })
    username: string;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    @IsIn([1, 2, 3, 4, 5], {
        message: 'The Role must be one of the following: 1, 2, 3, 4, 5',
    })
    role: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    userId: string;
}
