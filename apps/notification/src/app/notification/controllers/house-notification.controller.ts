import { Body, Controller } from '@nestjs/common'; 
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { HouseNotificationService } from '../services/house-notification.service';
import { AddHouseNotification, GetHouseNotification, GetHouseNotificationsByMCId } from '@myhome/contracts';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class HouseNotificationController {
    constructor(
        private readonly houseNotificationService: HouseNotificationService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetHouseNotificationsByMCId.topic)
    async getHouseNotificationsByMCId(@Body() { managementCompanyId }: GetHouseNotificationsByMCId.Request) {
        try {
            return this.houseNotificationService.getHouseNotificationsByMCId(managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(GetHouseNotification.topic)
    async getHouseNotification(@Body() { id }: GetHouseNotification.Request) {
        try {
            return this.houseNotificationService.getHouseNotification(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(AddHouseNotification.topic)
    async addHouseNotification(@Body() dto: AddHouseNotification.Request) {
        try {
            return this.houseNotificationService.addHouseNotification(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

}
