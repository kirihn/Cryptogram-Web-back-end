import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class UpdateUserNameDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'The username must not be empty' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message:
            'The user name can contain only English letters, numbers, and underscores',
    })
    @MaxLength(20, { message: 'Max length of username is 20 charachters' })
    username: string;
}
