import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReferenceAddMeter, ReferenceAddMeterReading, ReferenceGetMeterReading, ReferenceUpdateMeter, ReferenceGetMetersBySID, ReferenceGetMetersByMCId } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddMeterDto, UpdateMeterDto, GetMeterReadingDto, AddMeterReadingDto, GetMetersAllInfoBySID, GetMetersByMCIdDto } from '../../dtos/reference/meter.dto';
import { CatchError } from '../../error.filter';

@Controller('meter')
export class MeterController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-meters-by-mcid')
    async getMetersByMCId(@Body() dto: GetMetersByMCIdDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetMetersByMCId.Request,
                ReferenceGetMetersByMCId.Response
            >(ReferenceGetMetersByMCId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-meters-all-info-by-sid')
    async getMetersBySID(@Body() dto: GetMetersAllInfoBySID) {
        try {
            return await this.rmqService.send<
                ReferenceGetMetersBySID.Request,
                ReferenceGetMetersBySID.Response
            >(ReferenceGetMetersBySID.topic, dto);
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

    @HttpCode(200)
    @Post('get-meter-reading')
    async getMeterReading(@Body() dto: GetMeterReadingDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetMeterReading.Request,
                ReferenceGetMeterReading.Response
            >(ReferenceGetMeterReading.topic, dto);
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
