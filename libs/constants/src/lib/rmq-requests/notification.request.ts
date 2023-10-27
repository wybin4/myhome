import { RMQService } from 'nestjs-rmq';
import { AddServiceNotification, AddServiceNotifications, IAddServiceNotifications } from '@myhome/contracts';
import { IServiceNotification } from "@myhome/interfaces";
import { CANT_SEND_NOTIFICATION, CANT_SEND_NOTIFICATIONS } from '../errors/notification.errors';
import { RMQException } from '../exception';

export async function addNotification(rmqService: RMQService, notification: IServiceNotification) {
    try {
        return await rmqService.send<
            AddServiceNotification.Request,
            AddServiceNotification.Response
        >
            (AddServiceNotification.topic, { ...notification });
    } catch (e) {
        throw new RMQException(CANT_SEND_NOTIFICATION.message, CANT_SEND_NOTIFICATION.status);
    }
}

export async function addNotifications(
    rmqService: RMQService,
    notifications: IAddServiceNotifications
) {
    try {
        return await rmqService.send<
            AddServiceNotifications.Request,
            AddServiceNotifications.Response
        >
            (AddServiceNotifications.topic, { ...notifications });
    } catch (e) {
        throw new RMQException(CANT_SEND_NOTIFICATIONS.message, CANT_SEND_NOTIFICATIONS.status);
    }
}