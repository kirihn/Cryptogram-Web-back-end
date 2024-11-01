import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @IsString()
    @MinLength(1, {
        // 8
        message: 'password must be 8 least characters long',
    })
    oldPassword: string;

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
