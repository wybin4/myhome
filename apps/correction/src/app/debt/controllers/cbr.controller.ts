import { CorrectionGetKeyRate } from '@myhome/contracts';
import { Body, Controller, Post } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { CBRService } from '../services/cbr.service';

@Controller('cbr')
export class CBRController {
    constructor(
        private readonly cbrService: CBRService,
    ) { }

    @RMQValidate()
    @RMQRoute(CorrectionGetKeyRate.topic)
    async getKeyRate(@Body() dto: CorrectionGetKeyRate.Request) {
        try {
            return { keyRate: await this.cbrService.getKeyRate(dto) };
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
