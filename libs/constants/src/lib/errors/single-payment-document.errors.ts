import { HttpStatus } from "@nestjs/common";

export const CANT_DELETE_DOCUMENT_DETAILS = {
    message: 'Невозможно удалить детали ЕПД',
    status: HttpStatus.BAD_REQUEST
};
export const CANT_ADD_DOCUMENT_DETAILS = {
    message: 'Невозможно добавить детали ЕПД',
    status: HttpStatus.BAD_REQUEST
};
export const CANT_GET_SPD = {
    message: (spdId: number) => `Невозможно получить ЕПД с id=${spdId}`,
    status: HttpStatus.NOT_FOUND
};
export const CANT_GET_SPDS = {
    message: "Невозможно получить ЕПД",
    status: HttpStatus.NOT_FOUND
};