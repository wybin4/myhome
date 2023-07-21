import { Body, ConflictException, Controller, NotFoundException, Post } from '@nestjs/common';
import { ReferenceAddApartment, ReferenceGetApartment } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { GetApartmentDto, AddApartmentDto } from '../dtos/apartment.dto';

@Controller('apartment')
export class ApartmentController {
    constructor(private readonly rmqService: RMQService) { }

    @Post('get-apartment')
    async getApartment(@Body() dto: GetApartmentDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetApartment.Request,
                ReferenceGetApartment.Response
            >(ReferenceGetApartment.topic, dto);
        } catch (e) {
            if (e instanceof Error) {
                throw new NotFoundException(e.message);
            }
        }
    }

    @Post('add-apartment')
    async addApartment(@Body() dto: AddApartmentDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddApartment.Request,
                ReferenceAddApartment.Response
            >(ReferenceAddApartment.topic, dto);
        } catch (e) {
            if (e instanceof Error) {
                throw new ConflictException(e.message);
            }
        }
    }

}
