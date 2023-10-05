import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReferenceAddHouse, ReferenceGetHouse, ReferenceUpdateHouse, ReferenceGetHousesByMCId } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { GetHouseDto, AddHouseDto, UpdateHouseDto, GetHousesByMCIdDto } from '../../dtos/reference/house.dto';
import { CatchError } from '../../error.filter';

@Controller('house')
export class HouseController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-house')
    async getHouse(@Body() dto: GetHouseDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetHouse.Request,
                ReferenceGetHouse.Response
            >(ReferenceGetHouse.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-houses-by-mcid')
    async getHousesByMCId(@Body() dto: GetHousesByMCIdDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetHousesByMCId.Request,
                ReferenceGetHousesByMCId.Response
            >(ReferenceGetHousesByMCId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-house')
    async addHouse(@Body() dto: AddHouseDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddHouse.Request,
                ReferenceAddHouse.Response
            >(ReferenceAddHouse.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('update-house')
    async updateHouse(@Body() dto: UpdateHouseDto) {
        try {
            return await this.rmqService.send<
                ReferenceUpdateHouse.Request,
                ReferenceUpdateHouse.Response
            >(ReferenceUpdateHouse.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
