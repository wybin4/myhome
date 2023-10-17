import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ApartmentService } from '../services/apartment.service';
import { ReferenceGetApartment, ReferenceGetApartmentsBySubscribers, ReferenceGetApartmentsByMCId, ReferenceGetApartmentsAllInfo } from '@myhome/contracts';

@Controller('apartment')
export class ApartmentQueries {
    constructor(
        private readonly apartmentService: ApartmentService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetApartment.topic)
    async getApartment(@Body() { id }: ReferenceGetApartment.Request) {
        try {
            return await this.apartmentService.getApartment(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetApartmentsAllInfo.topic)
    async getApartmentsAllInfo(@Body() { subscriberIds }: ReferenceGetApartmentsAllInfo.Request) {
        try {
            return await this.apartmentService.getApartmentsAllInfo(subscriberIds);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetApartmentsBySubscribers.topic)
    async getApartmentsBySubscribers(@Body() { subscriberIds }: ReferenceGetApartmentsBySubscribers.Request) {
        try {
            return await this.apartmentService.getApartmentsBySubscribers(subscriberIds);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetApartmentsByMCId.topic)
    async getApartmentsByMCId(@Body() { managementCompanyId }: ReferenceGetApartmentsByMCId.Request) {
        try {
            return await this.apartmentService.getApartmentsByMCId(managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
