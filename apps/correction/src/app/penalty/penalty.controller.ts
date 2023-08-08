import { PenaltyService } from './penalty.service';
import { CorrectionGetPenalty } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller('penalty')
export class PenaltyController {
    constructor(
        private readonly penaltyService: PenaltyService,
    ) { }

    @RMQValidate()
    @RMQRoute(CorrectionGetPenalty.topic)
    async getPenalty(@Body() dto: CorrectionGetPenalty.Request) {
        try {
            return await this.penaltyService.getPenalty(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
