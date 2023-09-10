import { ReferenceAddApartment } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ApartmentService } from '../services/apartment.service';

@Controller()
export class ApartmentCommands {
    constructor(
        private readonly apartmentService: ApartmentService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceAddApartment.topic)
    async addApartment(@Body() dto: ReferenceAddApartment.Request) {
        try {
            return await this.apartmentService.addApartment(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
