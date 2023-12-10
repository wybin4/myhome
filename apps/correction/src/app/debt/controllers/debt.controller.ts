import { DebtService } from '../services/debt.service';
import { CorrectionAddDebts, CorrectionGetDebts, CorrectionCalculateDebts, CorrectionUpdateDebt } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller('debt')
export class DebtController {
    constructor(
        private readonly debtService: DebtService,
    ) { }

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
    @RMQRoute(CorrectionGetDebts.topic)
    async getDebts(@Body() dto: CorrectionGetDebts.Request) {
        try {
            return await this.debtService.getDebts(dto);
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
    @RMQRoute(CorrectionAddDebts.topic)
    async addDebts(@Body() dto: CorrectionAddDebts.Request) {
        try {
            return await this.debtService.addDebts(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
