import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateChatDto {
    @IsString()
    @IsNotEmpty({ message: 'The chatName must not be empty' })
    chatName: string;

    @IsBoolean()
    isGroup: boolean;

    @IsString()
    @IsNotEmpty()
    keyHash: string;

    @ValidateIf((dto) => !dto.isGroup)
    @IsString()
    @IsNotEmpty({ message: 'The userId must not be empty' })
    userId: string;
}
