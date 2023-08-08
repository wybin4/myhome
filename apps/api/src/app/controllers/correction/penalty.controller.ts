import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { CorrectionAddPenaltyCalculationRule } from '@myhome/contracts';
import { AddPenaltyCalculationRuleDto } from '../../dtos/correction/penalty.dto';

@Controller('penalty')
export class PenaltyController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(201)
    @Post('add-penalty-calculation-rule')
    async addPenaltyCalculationRule(@Body() dto: AddPenaltyCalculationRuleDto) {
        try {
            return await this.rmqService.send<
                CorrectionAddPenaltyCalculationRule.Request,
                CorrectionAddPenaltyCalculationRule.Response
            >(CorrectionAddPenaltyCalculationRule.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }
}
