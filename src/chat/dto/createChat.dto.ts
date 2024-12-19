import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateChatDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'The chatName must not be empty' })
    chatName: string;

    @ApiProperty()
    @IsBoolean()
    isGroup: boolean;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    keyHash: string;

    @ApiProperty()
    @ValidateIf((dto) => !dto.isGroup)
    @IsString()
    @IsNotEmpty({ message: 'The userId must not be empty' })
    userId: string;
}
