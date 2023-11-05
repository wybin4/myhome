import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { HouseService } from '../services/house.service';
import { ReferenceGetHouses, ReferenceGetHousesByUser } from '@myhome/contracts';

@Controller()
export class HouseQueries {
    constructor(
        private readonly houseService: HouseService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetHouses.topic)
    async getHouses(@Body() dto: ReferenceGetHouses.Request) {
        try {
            return await this.houseService.getHouses(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetHousesByUser.topic)
    async getHousesByMCId(@Body() dto: ReferenceGetHousesByUser.Request) {
        try {
            return await this.houseService.getHousesByUser(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
