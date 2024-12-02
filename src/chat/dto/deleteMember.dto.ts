import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    Matches,
} from 'class-validator';

export class DeleteMember {
    @IsNotEmpty({ message: 'The username must not be empty' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message:
            'The user name can contain only English letters, numbers, and underscores',
    })
    username: string;

    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;

    @IsOptional()
    userId: string;
}
