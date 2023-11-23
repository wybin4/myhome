import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { CorrectionService } from './correction.service';
import { GetCorrection } from '@myhome/contracts';

@Controller('correction')
export class CorrectionController {
    constructor(
        private readonly correctionService: CorrectionService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetCorrection.topic)
    async getCorrection(@Body() dto: GetCorrection.Request) {
        try {
            return await this.correctionService.getCorrection(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
