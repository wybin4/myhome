import { UserRole } from '@myhome/interfaces';
import { IsEnum, IsNumber } from 'class-validator';

export class UserInfoDto {
    @IsNumber()
    userId: number;

    @IsEnum(UserRole)
    userRole: UserRole;
}

export class GetUsersByAnotherRoleDto {
    @IsNumber()
    userId: number;

    @IsEnum(UserRole)
    userRole: UserRole;
}

export class GetAllUsersDto {
    @IsEnum(UserRole)
    userRole: UserRole;

    @IsEnum(UserRole)
    requesterRole: UserRole;
}
