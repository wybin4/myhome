import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReferenceAddMeter, ReferenceAddMeterReading, ReferenceUpdateMeter, ReferenceGetMetersByUser } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddMeterDto, UpdateMeterDto, AddMeterReadingDto, GetMetersByUserDto } from '../../dtos/reference/meter.dto';
import { CatchError } from '../../error.filter';

@Controller('meter')
export class MeterController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-meters-by-user')
    async getMetersByUser(@Body() dto: GetMetersByUserDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetMetersByUser.Request,
                ReferenceGetMetersByUser.Response
            >(ReferenceGetMetersByUser.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-meter')
    async addMeter(@Body() dto: AddMeterDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddMeter.Request,
                ReferenceAddMeter.Response
            >(ReferenceAddMeter.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('update-meter')
    async updateMeter(@Body() dto: UpdateMeterDto) {
        try {
            return await this.rmqService.send<
                ReferenceUpdateMeter.Request,
                ReferenceUpdateMeter.Response
            >(ReferenceUpdateMeter.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-meter-reading')
    async addMeterReading(@Body() dto: AddMeterReadingDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddMeterReading.Request,
                ReferenceAddMeterReading.Response
            >(ReferenceAddMeterReading.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }
}
