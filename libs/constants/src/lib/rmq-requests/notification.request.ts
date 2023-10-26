import { RMQService } from 'nestjs-rmq';
import { AddServiceNotification } from '@myhome/contracts';
import { IServiceNotification } from "@myhome/interfaces";
import { CANT_SEND_NOTIFICATION } from '../errors/notification.errors';
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