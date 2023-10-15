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
}
