import { ApiProperty } from '@nestjs/swagger';
import { ContactRequestsStatus } from '@prisma/client';
import { IsEnum, IsInt } from 'class-validator';

export class AddContactResponseDto {
    @ApiProperty()
    @IsInt()
    ContactRequestId: number;

    @ApiProperty()
    @IsEnum(ContactRequestsStatus, {
        message:
            'The status must be one of the following values: pending, accepted, blocked',
    })
    NewContactRequestStatus: ContactRequestsStatus;
}
