import { ReferenceGetManagementCompany, ReferenceGetSubscriberIdsByHouse, ReferenceGetSubscribersByMCId, ReferenceGetSubscribers, ReferenceGetSubscribersAllInfo, ReferenceGetSubscriber, ReferenceGetOwnersByMCId, ReferenceGetSubscribersByHouses } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { SubscriberService } from '../services/subscriber.service';

@Controller("subscriber")
export class SubscriberQueries {
    constructor(
        private readonly subscriberService: SubscriberService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetSubscriber.topic)
    async getSubscriber(@Body() { id }: ReferenceGetSubscriber.Request) {
        try {
            return await this.subscriberService.getSubscriber(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetManagementCompany.topic)
    async getManagementCompany(@Body() { subscriberId }: ReferenceGetManagementCompany.Request) {
        try {
            return await this.subscriberService.getManagementCompany(subscriberId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetManagementCompany.topic)
    async getHouseBySID(@Body() { subscriberId }: ReferenceGetManagementCompany.Request) {
        try {
            return await this.subscriberService.getHouseBySID(subscriberId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetSubscriberIdsByHouse.topic)
    async getSubscriberIdsByHouse(@Body() { houseId }: ReferenceGetSubscriberIdsByHouse.Request) {
        try {
            return await this.subscriberService.getSubscriberIdsByHouse(houseId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

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
    async getSubscribers(@Body() { ids }: ReferenceGetSubscribers.Request) {
        try {
            return await this.subscriberService.getSubscribers(ids);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetSubscribersAllInfo.topic)
    async getSubscribersAllInfo(@Body() { ids }: ReferenceGetSubscribersAllInfo.Request) {
        try {
            return await this.subscriberService.getSubscribersAllInfo(ids);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetSubscribersByMCId.topic)
    async getSubscribersByMCId(@Body() { managementCompanyId }: ReferenceGetSubscribersByMCId.Request) {
        try {
            return await this.subscriberService.getSubscribersByMCId(managementCompanyId);
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
}
