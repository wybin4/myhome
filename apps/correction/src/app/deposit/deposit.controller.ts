import { DepositService } from './deposit.service';
import { CorrectionGetDeposit, CorrectionAddDeposit } from '@myhome/contracts';
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

    @RMQValidate()
    @RMQRoute(CorrectionAddDeposit.topic)
    async addDeposit(@Body() dto: CorrectionAddDeposit.Request) {
        try {
            return await this.depositService.addDeposit(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
