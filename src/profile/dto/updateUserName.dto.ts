import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class UpdateUserNameDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'The username must not be empty' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message:
            'The user name can contain only English letters, numbers, and underscores',
    })
    username: string;
}
