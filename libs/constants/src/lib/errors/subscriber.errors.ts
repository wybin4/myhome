import { HttpStatus } from "@nestjs/common";

export const HOUSE_NOT_EXIST = {
    message: (id: number) => `Дом с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
export const APART_NOT_EXIST = {
    message: (id: number) => `Квартира с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
export const SUBSCRIBER_NOT_EXIST = {
    message: (id: number) => `Абонент с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
export const SUBSCRIBERS_NOT_EXIST = {
    message: 'Такие абоненты не существуют',
    status: HttpStatus.NOT_FOUND
};
export const APARTS_NOT_EXIST = {
    message: 'Такие квартиры не существуют',
    status: HttpStatus.NOT_FOUND
};
export const HOUSES_NOT_EXIST = {
    message: 'Такие дома не существуют',
    status: HttpStatus.NOT_FOUND
};
export const APART_ALREADY_EXIST = 'Такая квартира уже существует';
export const SUBSCRIBER_ALREADY_EXIST = 'Такой абонент уже существует';
export const SUBSCRIBER_ALREADY_ARCHIEVED = 'Абонент уже в архиве';
export const CANT_GET_SUBSCRIBERS_BY_HOUSE_ID = {
    message: 'Невозможно получить абонентов по id дома',
    status: HttpStatus.BAD_REQUEST
};
export const SUBSCRIBER_WITH_ID_NOT_EXIST = {
    message: (id: number) => `Абонент c id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
