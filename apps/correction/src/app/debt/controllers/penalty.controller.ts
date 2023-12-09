import { CorrectionAddPenaltyCalculationRules, CorrectionGetPenaltyCalculationRulesByMCId, CorrectionGetPenaltyRules } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { PenaltyRuleService } from '../services/penalty-rule.service';

@Controller('penalty')
export class PenaltyController {
    constructor(
        private readonly penaltyRuleService: PenaltyRuleService,
    ) { }

    @RMQValidate()
    @RMQRoute(CorrectionAddPenaltyCalculationRules.topic)
    async addPenaltyCalculationRules(@Body() dto: CorrectionAddPenaltyCalculationRules.Request) {
        try {
            return await this.penaltyRuleService.addPenaltyCalculationRules(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(CorrectionGetPenaltyCalculationRulesByMCId.topic)
    async getPenaltyCalculationRulesByMCId(@Body() { managementCompanyId }: CorrectionGetPenaltyCalculationRulesByMCId.Request) {
        try {
            return await this.penaltyRuleService.getPenaltyCalculationRulesByMCId(managementCompanyId);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(CorrectionGetPenaltyRules.topic)
    // eslint-disable-next-line no-empty-pattern
    async getPenaltyRules(@Body() { }: CorrectionGetPenaltyRules.Request) {
        try {
            return await this.penaltyRuleService.getPenaltyRules();
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
