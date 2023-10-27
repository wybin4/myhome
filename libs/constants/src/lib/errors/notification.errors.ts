import { HttpStatus } from "@nestjs/common";

export const NOTIFICATION_NOT_EXIST = {
    message: (id: number) => `Уведомление с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
};
export const NOTIFICATIONS_NOT_EXIST = {
    message: "Такие уведомления не существуют ",
    status: HttpStatus.NOT_FOUND
};
export const INCORRECT_HOUSE_NOTIF_TYPE = {
    message: 'Некорректный тип уведомления',
    status: HttpStatus.CONFLICT
};
export const CANT_SEND_NOTIFICATION = {
    message: "Невозможно отправить уведомление",
    status: HttpStatus.INTERNAL_SERVER_ERROR
};
export const CANT_SEND_NOTIFICATIONS = {
    message: "Невозможно отправить уведомления",
    status: HttpStatus.INTERNAL_SERVER_ERROR
};
