import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        description: 'User name',
        example: 'Kirill',
    })
    @IsString()
    @IsNotEmpty({ message: 'The name must not be empty' })
    name: string;

    @ApiProperty({
        description: 'User username',
        example: 'kirihn',
    })
    @IsNotEmpty({ message: 'The username must not be empty' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message:
            'The user name can contain only English letters, numbers, and underscores',
    })
    username: string;

    @ApiProperty({
        description: 'User email',
        example: 'user@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password',
        example: '2384',
    })
    @IsString()
    @MinLength(8, {
        message: 'password must be 8 least characters long',
    })
    password: string;

    @ApiProperty({
        description: 'User password',
        example: '2384',
    })
    @IsString()
    @MinLength(8, {
        message: 'password must be 8 least characters long',
    })
    repeatPassword: string;
}
