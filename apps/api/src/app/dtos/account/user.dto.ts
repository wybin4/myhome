import { UserRole } from '@myhome/interfaces';

export class UserInfoDto { }

export class GetUsersByAnotherRoleDto { }

export class GetAllUsersDto {
    userRole: UserRole;
}
