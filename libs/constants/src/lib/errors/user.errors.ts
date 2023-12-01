import { HttpStatus } from "@nestjs/common";

export const INCORRECT_USER_ROLE = {
    message: 'Некорректная роль пользователя',
    status: HttpStatus.BAD_REQUEST
};
export const USER_NOT_EXIST = {
    message: (id: number) => `Пользователь с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
export const INCORRECT_LOGIN = {
    message: 'Неверный логин',
    status: HttpStatus.BAD_REQUEST
};
export const INCORRECT_PASSWORD = {
    message: 'Неверный пароль',
    status: HttpStatus.BAD_REQUEST
};
export const USER_ALREADY_EXIST = {
    message: 'Такой пользователь уже существует',
    status: HttpStatus.BAD_REQUEST
};
export const INCORRECT_PASSWORD_LINK = {
    message: 'Неверная ссылка для установления пароля',
    status: HttpStatus.BAD_REQUEST
};
export const USERS_NOT_EXIST = {
    message: "Такие пользователи не существуют",
    status: HttpStatus.NOT_FOUND
};
export const INCORRECT_ROLE_ACCESS = {
    message: "Вы не можете получить доступ к этой информации",
    status: HttpStatus.BAD_REQUEST
};
export const INCORRECT_ROLE_ACTION = {
    message: "Вы не можете сделать это",
    status: HttpStatus.BAD_REQUEST
};
export const OWNER_NOT_EXIST = 'Такой пользователь не существует';
export const ADMIN_NOT_EXIST = 'Такой администратор не существует';
export const MANAG_COMP_NOT_EXIST = 'Такая управляющая компания не существует';
export const OWNERS_NOT_EXIST = {
    message: 'Такие пользователи не существуют',
    status: HttpStatus.NOT_FOUND
};
export const ADMINS_NOT_EXIST = {
    message: 'Такие администраторы не существуют',
    status: HttpStatus.NOT_FOUND
};
export const MANAG_COMPS_NOT_EXIST = {
    message: 'Такие управляющие компании не существуют',
    status: HttpStatus.NOT_FOUND
};
