import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class DeleteMember {
    @IsString()
    @IsNotEmpty({ message: 'The userId must not be empty' })
    userId: string;

    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
