import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReferenceAddHouse, ReferenceGetHousesByUser } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddHouseDto, GetHousesByUserDto } from '../../dtos/reference/house.dto';
import { CatchError } from '../../error.filter';

@Controller('house')
export class HouseController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-houses-by-user')
    async getHousesByUser(@Body() dto: GetHousesByUserDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetHousesByUser.Request,
                ReferenceGetHousesByUser.Response
            >(ReferenceGetHousesByUser.topic, dto);
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

}
