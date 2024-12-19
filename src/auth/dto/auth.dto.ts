import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
    @ApiProperty({
        description: 'User email',
        example: 'Swagger@Swagger.com',
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
}
