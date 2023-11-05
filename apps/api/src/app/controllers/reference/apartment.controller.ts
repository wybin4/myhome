import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReferenceAddApartment, ReferenceGetApartmentsByUser } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddApartmentDto, GetApartmentsByUserDto } from '../../dtos/reference/apartment.dto';
import { CatchError } from '../../error.filter';

@Controller('apartment')
export class ApartmentController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-apartments-by-user')
    async getApartmentsByUser(@Body() dto: GetApartmentsByUserDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetApartmentsByUser.Request,
                ReferenceGetApartmentsByUser.Response
            >(ReferenceGetApartmentsByUser.topic, dto);
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
