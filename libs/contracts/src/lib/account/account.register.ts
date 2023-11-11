import { IGetUser, IUser, UserRole } from '@myhome/interfaces';
import { IsEmail, IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace AccountRegister {
    export const topic = 'account.register.command';

    export class Request {
        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsEmail({}, { message: "Неверный email" })
        email!: string;

        @IsString()
        password!: string;

        @IsOptional()
        @IsString({ message: "Имя должно быть строкой" })
        @MaxLength(100, { message: "Имя пользователя не должно превышать 100 символов" })
        name?: string;

        @IsOptional()
        @IsString({ message: "Расчётный счёт быть строкой" })
        checkingAccount?: string;

        @Validate(IsValidEnumValue, [UserRole])
        registerRole!: UserRole;
    }

    export class Response {
        user!: IGetUser;
    }
}

export interface IAddUser extends Omit<Omit<IUser, "passwordHash">, "id"> {
    password: string;
}