import { DepositService } from './deposit.service';
import { CorrectionGetDeposit } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller('deposit')
export class DepositController {
    constructor(
        private readonly depositService: DepositService,
    ) { }

    @RMQValidate()
    @RMQRoute(CorrectionGetDeposit.topic)
    async getDeposit(@Body() dto: CorrectionGetDeposit.Request) {
        try {
            return await this.depositService.getDeposit(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
