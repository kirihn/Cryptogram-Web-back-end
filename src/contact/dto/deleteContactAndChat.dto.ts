import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class DeleteContactAndChatDto {
    @ApiProperty()
    @IsInt()
    ContactId: number;
}
