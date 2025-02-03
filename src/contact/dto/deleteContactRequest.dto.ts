import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class DeleteContactRequestDto {
    @ApiProperty()
    @IsInt()
    ContactRequestId: number;
}
