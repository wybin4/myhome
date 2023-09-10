import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { HouseService } from '../services/house.service';
import { ReferenceGetHouse } from '@myhome/contracts';

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
}
