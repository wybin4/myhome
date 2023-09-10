import { ReferenceAddHouse, ReferenceUpdateHouse } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { HouseService } from '../services/house.service';

@Controller()
export class HouseCommands {
    constructor(
        private readonly houseService: HouseService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceAddHouse.topic)
    async addHouse(@Body() dto: ReferenceAddHouse.Request) {
        try {
            return await this.houseService.addHouse(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceUpdateHouse.topic)
    async updateHouse(@Body() { id, managementCompanyId }: ReferenceUpdateHouse.Request) {
        try {
            return await this.houseService.updateHouse(id, managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
