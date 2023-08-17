import { HttpStatus, Injectable } from "@nestjs/common";
import { PenaltyRuleRepository } from "../repositories/penalty-rule.repository";
import { RMQException, PENALTY_RULE_NOT_EXIST, PENALTY_CALCULATION_WITH_PRIORITY_ALREADY_EXIST, MANAG_COMP_NOT_EXIST } from "@myhome/constants";
import { CorrectionAddPenaltyCalculationRule, AccountUserInfo, ReferenceGetTypesOfService } from "@myhome/contracts";
import { UserRole } from "@myhome/interfaces";
import { RMQError, RMQService } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { PenaltyRuleEntity } from "../entities/penalty-rule.entity";

@Injectable()
export class PenaltyRuleService {
    constructor(
        private readonly penaltyRuleRepository: PenaltyRuleRepository,
        private readonly rmqService: RMQService
    ) { }

    public async getAllPenaltyRules() {
        return await this.penaltyRuleRepository.findAll();
    }

    public async addPenaltyCalculationRule(dto: CorrectionAddPenaltyCalculationRule.Request) {
        const penaltyRule = await this.penaltyRuleRepository.findById(dto.penaltyRuleId);
        if (!penaltyRule) {
            throw new RMQException(PENALTY_RULE_NOT_EXIST.message, PENALTY_RULE_NOT_EXIST.status);
        }
        await this.checkManagementCompany(dto.managementCompanyId);
        const { typesOfService } = await this.checkTypesOfService(dto.typeOfServiceIds);
        const typeOfServiceIds = typesOfService.map(obj => obj.id);

        const result = await this.penaltyRuleRepository.findByManagementCIDAndPriority(dto.managementCompanyId, dto.priority);
        if (result) {
            throw new RMQException(
                PENALTY_CALCULATION_WITH_PRIORITY_ALREADY_EXIST.message(dto.priority),
                PENALTY_CALCULATION_WITH_PRIORITY_ALREADY_EXIST.status
            );
        }

        const penaltyCalculationRule = {
            managementCompanyId: dto.managementCompanyId,
            typeOfServiceIds: typeOfServiceIds,
            priority: dto.priority
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