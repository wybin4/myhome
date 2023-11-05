import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ApartmentService } from '../services/apartment.service';
import { ReferenceGetApartments, ReferenceGetApartmentsBySubscribers, ReferenceGetApartmentsByUser } from '@myhome/contracts';

@Controller('apartment')
export class ApartmentQueries {
    constructor(
        private readonly apartmentService: ApartmentService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetApartmentsBySubscribers.topic)
    async getApartmentsBySubscribers(@Body() dto: ReferenceGetApartmentsBySubscribers.Request) {
        try {
            return await this.apartmentService.getApartmentsBySubscribers(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetApartmentsByUser.topic)
    async getApartmentsByUser(@Body() dto: ReferenceGetApartmentsByUser.Request) {
        try {
            return await this.apartmentService.getApartmentsByUser(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetApartments.topic)
    async getApartments(@Body() { ids }: ReferenceGetApartments.Request) {
        try {
            return await this.apartmentService.getApartments(ids);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
