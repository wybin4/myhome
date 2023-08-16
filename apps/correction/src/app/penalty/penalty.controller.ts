import { PenaltyService } from './services/penalty.service';
import { CorrectionAddPenaltyCalculationRule, CorrectionGetPenalty } from '@myhome/contracts';
import { Body, Controller, Post } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { PenaltyRuleService } from './services/penalty-rule.service';

@Controller('penalty')
export class PenaltyController {
    constructor(
        private readonly penaltyService: PenaltyService,
        private readonly penaltyRuleService: PenaltyRuleService,
    ) { }

    @Post('get-penalty')
    // @RMQValidate()
    // @RMQRoute(CorrectionGetPenalty.topic)
    async getPenalty(@Body() dto: CorrectionGetPenalty.Request) {
        try {
            return await this.penaltyService.getPenalty(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(CorrectionAddPenaltyCalculationRule.topic)
    async addPenaltyCalculationRule(@Body() dto: CorrectionAddPenaltyCalculationRule.Request) {
        try {
            return await this.penaltyRuleService.addPenaltyCalculationRule(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
