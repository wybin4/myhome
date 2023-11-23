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
    registerRole: UserRole;
}