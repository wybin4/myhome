import { IAddUsers } from '@myhome/contracts';
import { UserRole } from '@myhome/interfaces';

export class LoginDto {
    email: string;
    password: string;
    userRole: UserRole;
}

export class RegisterDto {
    userRole: UserRole;
    email: string;
    name?: string;
    checkingAccount?: string;
}

export class RegisterManyDto {
    profiles: IAddUsers[];
    userRole: UserRole;
}

export class SetPasswordDto {
    password: string;
    userRole: UserRole;
    link: string;
}