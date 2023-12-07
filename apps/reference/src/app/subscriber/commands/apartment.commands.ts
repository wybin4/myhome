import { ReferenceAddApartments } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ApartmentService } from '../services/apartment.service';

@Controller('apartment')
export class ApartmentCommands {
    constructor(
        private readonly apartmentService: ApartmentService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceAddApartments.topic)
    async addApartments(@Body() dto: ReferenceAddApartments.Request) {
        try {
            return await this.apartmentService.addApartments(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
