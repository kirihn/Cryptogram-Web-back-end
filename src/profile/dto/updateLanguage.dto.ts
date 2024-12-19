import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateLanguageDto {
    @ApiProperty()
    @IsString()
    @IsIn(['ru', 'en', 'fr', 'de'], {
        message: 'The language must be one of the following: ru, en, fr, de',
    })
    language: string;
}
