import { BadRequestException, Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { CorrectionAddPenaltyCalculationRule, CorrectionGetPenaltyCalculationRulesByMCId } from '@myhome/contracts';
import { AddPenaltyCalculationRuleDto, GetPenaltyCalculationRulesByMCIdDto } from '../../dtos/correction/penalty.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { UserRole } from '@myhome/interfaces';
import { INCORRECT_USER_ROLE } from '@myhome/constants';

@Controller('penalty')
export class PenaltyController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(201)
    @Post('add-penalty-calculation-rule')
    async addPenaltyCalculationRule(@Req() req, @Body() dto: AddPenaltyCalculationRuleDto) {
        try {
            if (req.user.userRole === UserRole.ManagementCompany) {
                const managementCompanyId = req.userId;
                return await this.rmqService.send<
                    CorrectionAddPenaltyCalculationRule.Request,
                    CorrectionAddPenaltyCalculationRule.Response
                >(CorrectionAddPenaltyCalculationRule.topic, { ...dto, managementCompanyId });
            } else {
                throw new BadRequestException(INCORRECT_USER_ROLE);
            }
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-penalty-rules-by-mcid')
    async getPenaltyRulesByMCId(@Req() req, @Body() dto: GetPenaltyCalculationRulesByMCIdDto) {
        try {
            if (req.user.userRole === UserRole.ManagementCompany) {
                const managementCompanyId = req.userId;
                return await this.rmqService.send<
                    CorrectionGetPenaltyCalculationRulesByMCId.Request,
                    CorrectionGetPenaltyCalculationRulesByMCId.Response
                >(CorrectionGetPenaltyCalculationRulesByMCId.topic, { ...dto, managementCompanyId });
            } else {
                throw new BadRequestException(INCORRECT_USER_ROLE);
            }
        } catch (e) {
            CatchError(e);
        }
    }
}
