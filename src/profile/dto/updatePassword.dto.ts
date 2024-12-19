import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @ApiProperty()
    @IsString()
    @MinLength(8, {
        message: 'password must be 8 least characters long',
    })
    oldPassword: string;

    @ApiProperty()
    @IsString()
    @MinLength(8, {
        message: 'password must be 8 least characters long',
    })
    password: string;

    @ApiProperty()
    @IsString()
    @MinLength(8, {
        message: 'password must be 8 least characters long',
    })
    repeatPassword: string;
}
