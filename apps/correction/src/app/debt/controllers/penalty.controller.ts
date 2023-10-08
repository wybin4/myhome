import { CorrectionAddPenaltyCalculationRule, CorrectionGetPenaltyCalculationRulesByMCId } from '@myhome/contracts';
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
    @RMQRoute(CorrectionAddPenaltyCalculationRule.topic)
    async addPenaltyCalculationRule(@Body() dto: CorrectionAddPenaltyCalculationRule.Request) {
        try {
            return await this.penaltyRuleService.addPenaltyCalculationRule(dto);
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

}
