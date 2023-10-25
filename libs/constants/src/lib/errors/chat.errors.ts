import { HttpStatus } from "@nestjs/common";

export const SENDER_NOT_EXIST = {
    message: 'Такой отправитель не существует',
    status: HttpStatus.BAD_REQUEST
};