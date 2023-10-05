import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReferenceAddApartment, ReferenceGetApartment, ReferenceGetApartmentsByMCId } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { GetApartmentDto, AddApartmentDto, GetApartmentsByMCIdDto } from '../../dtos/reference/apartment.dto';
import { CatchError } from '../../error.filter';

@Controller('apartment')
export class ApartmentController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-apartment')
    async getApartment(@Body() dto: GetApartmentDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetApartment.Request,
                ReferenceGetApartment.Response
            >(ReferenceGetApartment.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-apartments-by-mcid')
    async getApartmentsByMCId(@Body() dto: GetApartmentsByMCIdDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetApartmentsByMCId.Request,
                ReferenceGetApartmentsByMCId.Response
            >(ReferenceGetApartmentsByMCId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-apartment')
    async addApartment(@Body() dto: AddApartmentDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddApartment.Request,
                ReferenceAddApartment.Response
            >(ReferenceAddApartment.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
