import { HttpStatus } from "@nestjs/common";

export const APPEAL_NOT_EXIST = {
    message: (id: number) => `Обращение с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
export const APPEALS_NOT_EXIST = {
    message: 'Такие обращения не существуют',
    status: HttpStatus.NOT_FOUND
};
export const TYPES_OF_APPEAL_NOT_EXIST = {
    message: 'Такие типы обращений не существует',
    status: HttpStatus.CONFLICT
};