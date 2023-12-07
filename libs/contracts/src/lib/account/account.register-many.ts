import { IGetUser, IUser, UserRole } from '@myhome/interfaces';
import { ArrayMinSize, IsDefined, IsEmail, IsOptional, IsString, MaxLength, Validate, ValidateNested } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';
import { Type } from 'class-transformer';

export namespace AccountRegisterMany {
    export const topic = 'account.register-many.command';

    class UserValidator {
        @IsEmail({}, { message: "Неверный email" })
        email!: string;

        @IsOptional()
        @IsString({ message: "Имя должно быть строкой" })
        @MaxLength(100, { message: "Имя пользователя не должно превышать 100 символов" })
        name?: string;

        @IsOptional()
        @IsString({ message: "Расчётный счёт быть строкой" })
        checkingAccount?: string;
    }

    export class Request {
        @IsDefined({ message: "Массив пользователей должен существовать" })
        @ArrayMinSize(1, {message: "Массив пользователей не должен быть пустым"})
        @ValidateNested({ each: true, always: true })
        @Type(() => UserValidator)
        profiles!: IAddUsers[];

        @Validate(IsValidEnumValue, [UserRole])
        registerRole!: UserRole;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        profiles!: IGetUser[];
    }
}

export type IAddUsers = Omit<Omit<Omit<IUser, "passwordHash">, "id">, "userRole">;