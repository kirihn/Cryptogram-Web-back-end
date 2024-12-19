import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNameDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'The name must not be empty' })
    @IsString()
    name: string;
}
