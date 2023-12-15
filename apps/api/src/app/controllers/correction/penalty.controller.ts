import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { CorrectionAddPenaltyCalculationRules, CorrectionGetPenaltyCalculationRulesByMCId, CorrectionGetPenaltyRules } from '@myhome/contracts';
import { AddPenaltyCalculationRuleDto, GetPenaltyCalculationRulesByMCIdDto, GetPenaltyRulesDto } from '../../dtos/correction/penalty.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload, UserRole } from '@myhome/interfaces';
import { RoleGuard } from '../../guards/role.guard';

@Controller('penalty')
export class PenaltyController {
    constructor(private readonly rmqService: RMQService) { }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(201)
    @Post('add-penalty-calculation-rules')
    async addPenaltyCalculationRules(@Req() req: { user: IJWTPayload }, @Body() dto: AddPenaltyCalculationRuleDto) {
        try {
            const managementCompanyId = req.user.userId;
            return await this.rmqService.send<
                CorrectionAddPenaltyCalculationRules.Request,
                CorrectionAddPenaltyCalculationRules.Response
            >(CorrectionAddPenaltyCalculationRules.topic, { ...dto, managementCompanyId });
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(200)
    @Post('get-penalty-calculation-rules-by-mcid')
    async getPenaltyRulesByMCId(@Req() req: { user: IJWTPayload }, @Body() dto: GetPenaltyCalculationRulesByMCIdDto) {
        try {
            const managementCompanyId = req.user.userId;
            return await this.rmqService.send<
                CorrectionGetPenaltyCalculationRulesByMCId.Request,
                CorrectionGetPenaltyCalculationRulesByMCId.Response
            >(CorrectionGetPenaltyCalculationRulesByMCId.topic, { ...dto, managementCompanyId });
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-penalty-rules')
    async getPenaltyRules(@Body() dto: GetPenaltyRulesDto) {
        try {
            return await this.rmqService.send<
                CorrectionGetPenaltyRules.Request,
                CorrectionGetPenaltyRules.Response
            >(CorrectionGetPenaltyRules.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }
}
