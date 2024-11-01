import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ChatRoleGuard } from 'src/guards/chatRoleGuard.guard';

export function CheckChatRole(...roles: number[]) {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(ChatRoleGuard),
    );
}
