import { HttpStatus } from "@nestjs/common";

export const HOME_NOT_EXIST = 'Такой дом не существует';
export const APART_NOT_EXIST = 'Такая квартира не существует';
export const SUBSCRIBER_NOT_EXIST = 'Такой абонент не существует';
export const APART_ALREADY_EXIST = 'Такая квартира уже существует';
export const SUBSCRIBER_ALREADY_EXIST = 'Такой абонент уже существует';
export const SUBSCRIBER_ALREADY_ARCHIEVED = 'Абонент уже в архиве';
export const CANT_GET_SUBSCRIBER = 'Не удалось получить пользователя';
export const CANT_GET_SUBSCRIBER_WITH_ID = 'Не удалось получить пользователя с id ';
export const CANT_GET_SUBSCRIBERS_BY_HOUSE_ID = {
    message: 'Невозможно получить абонентов по id дома',
    status: HttpStatus.BAD_REQUEST
};
export const SUBSCRIBER_WITH_ID_NOT_EXIST = {
    message: (id: number) => `Абонент c id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
