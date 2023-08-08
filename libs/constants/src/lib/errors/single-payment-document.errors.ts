import { HttpStatus } from "@nestjs/common";

export const CANT_DELETE_DOCUMENT_DETAILS = {
    message: 'Невозможно удалить детали ЕПД',
    status: HttpStatus.BAD_REQUEST
}