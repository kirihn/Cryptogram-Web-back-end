import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNameDto {
    @IsNotEmpty({ message: 'The name must not be empty' })
    @IsString()
    name: string;
}
