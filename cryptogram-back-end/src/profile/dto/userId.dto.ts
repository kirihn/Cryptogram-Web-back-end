import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UserIdDto {
    @IsString()
    @IsNotEmpty()
    @Length(25, 25, {
        message: 'invalid userId',
    })
    userId: string;
}
