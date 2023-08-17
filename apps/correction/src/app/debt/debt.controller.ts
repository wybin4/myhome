import { DebtService } from './debt.service';
import { CorrectionAddDebt, CorrectionGetDebt, CorrectionCalculateDebts, CorrectionUpdateDebt } from '@myhome/contracts';
import { Body, Controller, Post } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller('debt')
export class DebtController {
    constructor(
        private readonly debtService: DebtService,
    ) { }

    @Post('calculate-debts')
    @RMQValidate()
    @RMQRoute(CorrectionCalculateDebts.topic)
    async calculateDebts(@Body() dto: CorrectionCalculateDebts.Request) {
        try {
            return await this.debtService.calculateDebts(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(CorrectionGetDebt.topic)
    async getDebt(@Body() dto: CorrectionGetDebt.Request) {
        try {
            return await this.debtService.getDebt(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(CorrectionUpdateDebt.topic)
    async updateDebt(@Body() dto: CorrectionUpdateDebt.Request) {
        try {
            return await this.debtService.updateDebt(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(CorrectionAddDebt.topic)
    async addDebt(@Body() dto: CorrectionAddDebt.Request) {
        try {
            return await this.debtService.addDebt(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
