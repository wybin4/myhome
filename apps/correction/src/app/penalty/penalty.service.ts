import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { PenaltyRepository } from "./repositories/penalty.repository";
import { AccountUserInfo, CorrectionAddPenaltyCalculationRule, CorrectionGetPenalty, ReferenceGetTypesOfService } from "@myhome/contracts";
import { MANAG_COMP_NOT_EXIST, PENALTY_RULE_NOT_EXIST, RMQException } from "@myhome/constants";
import { UserRole } from "@myhome/interfaces";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { PenaltyRuleRepository } from "./repositories/penalty-rule.repository";
import { PenaltyRuleEntity } from "./entities/penalty-rule.entity";

@Injectable()
export class PenaltyService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly penaltyRepository: PenaltyRepository,
        private readonly penaltyRuleRepository: PenaltyRuleRepository,
    ) { }

    public async getPenalty(dto: CorrectionGetPenalty.Request) {
        ;
    }

    public async addPenaltyCalculationRule(dto: CorrectionAddPenaltyCalculationRule.Request) {
        const penaltyRule = await this.penaltyRuleRepository.findById(dto.penaltyRuleId);
        if (!penaltyRule) {
            throw new RMQException(PENALTY_RULE_NOT_EXIST.message, PENALTY_RULE_NOT_EXIST.status);
        }
        await this.checkManagementCompany(dto.managementCompanyId);
        const { typesOfService } = await this.checkTypesOfService(dto.typeOfServiceIds);
        const typeOfServiceIds = typesOfService.map(obj => obj.id);

        const penaltyCalculationRule = {
            managementCompanyId: dto.managementCompanyId,
            typeOfServiceIds: typeOfServiceIds
        };
        const penaltyRuleEntity = new PenaltyRuleEntity(penaltyRule).addCalculationRule(penaltyCalculationRule);

        await this.penaltyRuleRepository.update(await penaltyRuleEntity);
        return { penaltyCalculationRule: penaltyCalculationRule }
    }

    private async checkManagementCompany(managementCompanyId: number) {
        try {
            await this.rmqService.send
                <
                    AccountUserInfo.Request,
                    AccountUserInfo.Response
                >
                (AccountUserInfo.topic, { id: managementCompanyId, role: UserRole.ManagementCompany });
        } catch (e) {
            throw new RMQError(MANAG_COMP_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
    }

    private async checkTypesOfService(typeOfServiceIds: number[]) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetTypesOfService.Request,
                    ReferenceGetTypesOfService.Response
                >
                (ReferenceGetTypesOfService.topic, { typeOfServiceIds: typeOfServiceIds });
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}