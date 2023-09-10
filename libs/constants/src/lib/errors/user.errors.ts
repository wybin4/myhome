import { HttpStatus } from "@nestjs/common";

export const INCORRECT_USER_ROLE = 'Некорректная роль пользователя';
export const USER_NOT_EXIST = {
    message: (id: number) => `Пользователь с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
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
