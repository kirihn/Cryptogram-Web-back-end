import { IsIn, IsString } from 'class-validator';

export class UpdateLanguageDto {
    @IsString()
    @IsIn(['ru', 'en', 'fr', 'de'], {
        message: 'The language must be one of the following: ru, en, fr, de',
    })
    language: string;
}
