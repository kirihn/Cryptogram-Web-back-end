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
    @IsIn([1, 2, 3], {
        message: 'The Role must be one of the following: 1, 2, 3',
    })
    role: number;

    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
