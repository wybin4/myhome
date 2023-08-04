import { HttpStatus } from "@nestjs/common";

export const METER_NOT_EXIST = 'Такой счётчик не существует';
export const METER_READING_NOT_EXIST = 'Такое показание не существует';
export const METER_ALREADY_EXIST = 'Такой счётчик уже существует';
export const INCORRECT_METER_TYPE = 'Некорректный тип счётчика';
export const MISSING_PREVIOUS_READING = {
    message: (meterId: number) =>
        `Для счётчика с id=${meterId} есть показания за текущий, но нет за предыдущий период`,
    status: HttpStatus.UNPROCESSABLE_ENTITY,
};
export const FAILED_TO_GET_METER_READINGS = {
    message: (meterId: number) =>
        `Для счётчика с id=${meterId} нет показаний`,
    status: HttpStatus.NOT_FOUND,
};
export const FAILED_TO_GET_MR = {
    message: 'Для такого счётчика нет показаний',
    status: HttpStatus.NOT_FOUND,
};
export const FAILED_TO_GET_READINGS_WITHOUT_NORMS = {
    message: 'Невозможно получить показания из-за отсутствия нормативов',
    status: HttpStatus.BAD_REQUEST,
};