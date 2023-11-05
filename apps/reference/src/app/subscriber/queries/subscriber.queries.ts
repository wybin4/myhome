import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { SubscriberService } from '../services/subscriber.service';
import { ReferenceGetSubscribersByHouses, ReferenceGetSubscribersByUser, ReferenceGetSubscribers, ReferenceGetOwnersByMCId, ReferenceGetReceiversByOwner } from '@myhome/contracts';

@Controller("subscriber")
export class SubscriberQueries {
    constructor(
        private readonly subscriberService: SubscriberService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetSubscribersByHouses.topic)
    async getSubscribersByHouses(@Body() { houseIds }: ReferenceGetSubscribersByHouses.Request) {
        try {
            return await this.subscriberService.getSubscribersByHouses(houseIds);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetSubscribers.topic)
    async getSubscribers(@Body() dto: ReferenceGetSubscribers.Request) {
        try {
            return await this.subscriberService.getSubscribers(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetSubscribersByUser.topic)
    async getSubscribersByUser(@Body() dto: ReferenceGetSubscribersByUser.Request) {
        try {
            return await this.subscriberService.getSubscribersByUser(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetOwnersByMCId.topic)
    async getOwnersByMCId(@Body() { managementCompanyId }: ReferenceGetOwnersByMCId.Request) {
        try {
            return await this.subscriberService.getOwnersByMCId(managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetReceiversByOwner.topic)
    async getReceiversByOwner(@Body() { ownerId }: ReferenceGetReceiversByOwner.Request) {
        try {
            return await this.subscriberService.getReceiversByOwner(ownerId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
