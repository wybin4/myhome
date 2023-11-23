import { UserRole } from '@myhome/interfaces';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const role = this.reflector.get<UserRole>('role', context.getHandler());
        const request = context.switchToHttp().getRequest();
        if (request.user) {
            const userRole: UserRole = request.user.userRole;
            return userRole === role;
        }
        return false;
    }
}
