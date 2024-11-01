import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(1, {
        // 8
        message: 'password must be 8 least characters long',
    })
    password: string;
}
