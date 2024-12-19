import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class DeleteMember {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'The userId must not be empty' })
    userId: string;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty({ message: 'The chatId must not be empty' })
    @IsPositive()
    chatId: number;
}
