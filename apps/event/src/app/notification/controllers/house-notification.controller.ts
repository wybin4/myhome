import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { HouseNotificationService } from '../services/house-notification.service';
import { EventAddHouseNotification, EventGetHouseNotification, EventGetHouseNotificationsByMCId } from '@myhome/contracts';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class HouseNotificationController {
    constructor(
        private readonly houseNotificationService: HouseNotificationService,
    ) { }

    @RMQValidate()
    @RMQRoute(EventGetHouseNotificationsByMCId.topic)
    async getHouseNotificationsByMCId(@Body() { managementCompanyId }: EventGetHouseNotificationsByMCId.Request) {
        try {
            return this.houseNotificationService.getHouseNotificationsByMCId(managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventGetHouseNotification.topic)
    async getHouseNotification(@Body() { id }: EventGetHouseNotification.Request) {
        try {
            return this.houseNotificationService.getHouseNotification(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventAddHouseNotification.topic)
    async addHouseNotification(@Body() dto: EventAddHouseNotification.Request) {
        try {
            return this.houseNotificationService.addHouseNotification(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

}
