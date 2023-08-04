import { HttpStatus } from "@nestjs/common";

export const TYPE_OF_SERVICE_NOT_EXIST = 'Такая услуга не существует';
export const UNIT_NOT_EXIST = 'Такая единица измерения не существует';
export const TYPES_OF_SERVICE_NOT_EXIST = {
    message: "Запрошенные услуги не существуют",
    status: HttpStatus.NOT_FOUND
};
