import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'The name must not be empty' })
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty({ message: 'The username must not be empty' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message:
            'The user name can contain only English letters, numbers, and underscores',
    })
    username: string;

    @IsString()
    @MinLength(1, {
        // 8
        message: 'password must be 8 least characters long',
    })
    password: string;

    @IsString()
    @MinLength(1, {
        // 8
        message: 'password must be 8 least characters long',
    })
    repeatPassword: string;
}
