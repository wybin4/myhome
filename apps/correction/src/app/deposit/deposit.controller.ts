import { DepositService } from './deposit.service';
import { CorrectionGetDeposit, CorrectionAddDeposit, CorrectionUpdateDeposit } from '@myhome/contracts';
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
    async getDeposit(@Body() { subscriberSPDs }: CorrectionGetDeposit.Request) {
        try {
            return await this.depositService.getDeposit(subscriberSPDs);
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

    @RMQValidate()
    @RMQRoute(CorrectionUpdateDeposit.topic)
    async updateDeposit(@Body() dto: CorrectionUpdateDeposit.Request) {
        try {
            return await this.depositService.updateDeposit(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
