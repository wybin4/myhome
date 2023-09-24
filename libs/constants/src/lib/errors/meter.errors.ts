import { HttpStatus } from "@nestjs/common";

export const METER_NOT_EXIST = {
    message: (id: number) => `Счётчик с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
export const METERS_NOT_EXIST = {
    message: 'Такие счётчики не существуют',
    status: HttpStatus.NOT_FOUND
};
export const METER_READING_NOT_EXIST = {
    message: (id: number) => `Показание с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
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
export const FAILED_TO_GET_PREVIOUS_READINGS = {
    message: (meterId: number) =>
        `Невозможно получить предыдущие показания счётчика с id=${meterId}`,
    status: HttpStatus.NOT_FOUND,
};
export const FAILED_TO_GET_CURRENT_READINGS = {
    message: (meterId: number) =>
        `Невозможно получить текущие показания счётчика с id=${meterId}`,
    status: HttpStatus.NOT_FOUND,
};
export const FAILED_TO_GET_INDIVIDUAL_READINGS = {
    message: 'Невозможно получить показания индивидуальных счётчиков для такой услуги',
    status: HttpStatus.NOT_FOUND,
};