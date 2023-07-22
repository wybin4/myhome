import { Body, ConflictException, Controller, HttpCode, NotFoundException, Post } from '@nestjs/common';
import { ReferenceAddHouse, ReferenceGetHouse, ReferenceUpdateHouse } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { GetHouseDto, AddHouseDto, UpdateHouseDto } from '../dtos/house.dto';

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
            if (e instanceof Error) {
                throw new NotFoundException(e.message);
            }
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
            if (e instanceof Error) {
                throw new ConflictException(e.message);
            }
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
            if (e instanceof Error) {
                throw new NotFoundException(e.message);
            }
        }
    }

}
