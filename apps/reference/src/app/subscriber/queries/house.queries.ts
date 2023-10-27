import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { HouseService } from '../services/house.service';
import { ReferenceGetHouse, ReferenceGetHouseAllInfo, ReferenceGetHouses, ReferenceGetHousesByMCId } from '@myhome/contracts';

@Controller()
export class HouseQueries {
    constructor(
        private readonly houseService: HouseService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetHouse.topic)
    async getHouse(@Body() { id }: ReferenceGetHouse.Request) {
        try {
            return await this.houseService.getHouse(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetHouseAllInfo.topic)
    async getHouseAllInfo(@Body() { id }: ReferenceGetHouseAllInfo.Request) {
        try {
            return await this.houseService.getHouseAllInfo(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetHouses.topic)
    async getHouses(@Body() { houseIds }: ReferenceGetHouses.Request) {
        try {
            return await this.houseService.getHouses(houseIds);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetHousesByMCId.topic)
    async getHousesByMCId(@Body() { managementCompanyId }: ReferenceGetHousesByMCId.Request) {
        try {
            return await this.houseService.getHousesByMCId(managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
