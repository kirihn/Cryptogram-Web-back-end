import {
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
} from 'class-validator';

export class AddMemberDto {
    @IsString()
    @IsNotEmpty({ message: 'The userId must not be empty' })
    userId: string;

    @IsNumber()
    @IsNotEmpty()
    @IsIn([2, 3, 4, 5], {
        message: 'The Role must be one of the following: 2, 3, 4, 5',
    })
    role: number;

    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
