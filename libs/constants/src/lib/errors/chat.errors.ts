import { HttpStatus } from "@nestjs/common";

export const SENDER_NOT_EXIST = {
    message: 'Такой отправитель не существует',
    status: HttpStatus.BAD_REQUEST
};
export const CHAT_NOT_EXIST = {
    message: (id: string) => `Чат с id=${id} не существует`,
    status: HttpStatus.BAD_REQUEST
};