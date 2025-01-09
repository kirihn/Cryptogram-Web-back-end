import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateLanguageDto {
    @ApiProperty()
    @IsString()
    @IsIn(
        [
            'ru',
            'en',
            'fr',
            'de',
            'es',
            'it',
            'pt',
            'tr',
            'sv',
            'da',
            'no',
            'pl',
            'uk',
            'ja',
            'zh',
            'ko',
            'ar',
        ],
        {
            message: 'this language is not supported',
        },
    )
    language: string;
}
