import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateNameDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'The name must not be empty' })
    @IsString()
    @MaxLength(20, { message: 'Max length of name is 20 charachters' })
    name: string;
}
