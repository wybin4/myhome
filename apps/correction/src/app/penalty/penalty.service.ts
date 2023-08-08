import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { PenaltyRepository } from "./repositories/penalty.repository";
import { AccountUserInfo, CorrectionAddPenaltyCalculationRule, CorrectionGetPenalty, ReferenceGetTypeOfService } from "@myhome/contracts";
import { PenaltyCalculationRuleEntity } from "./entities/penalty-calculation-rule.entity";
import { MANAG_COMP_NOT_EXIST, PENALTY_RULE_NOT_EXIST, RMQException, TYPE_OF_SERVICE_NOT_EXIST } from "@myhome/constants";
import { UserRole } from "@myhome/interfaces";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { PenaltyRuleRepository } from "./repositories/penalty-rule.repository";
import { PenaltyCalculationRuleRepository } from "./repositories/penalty-calculation-rule.repository";

@Injectable()
export class PenaltyService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly penaltyRepository: PenaltyRepository,
        private readonly penaltyRuleRepository: PenaltyRuleRepository,
        private readonly penaltyCalculationRuleRepository: PenaltyCalculationRuleRepository,
    ) { }

    public async getPenalty(dto: CorrectionGetPenalty.Request) {
        ;
    }

    public async addPenaltyCalculationRule(dto: CorrectionAddPenaltyCalculationRule.Request) {
        const newEntity = new PenaltyCalculationRuleEntity(dto);

        await this.checkManagementCompany(dto.managementCompanyId);
        await this.checkTypeOfService(dto.typeOfServiceId);
        const penaltyRule = await this.penaltyRuleRepository.findPenaltyRuleById(dto.penaltyRuleId);
        if (!penaltyRule) {
            throw new RMQException(PENALTY_RULE_NOT_EXIST.message, PENALTY_RULE_NOT_EXIST.status);
        }

        const newPCR = await this.penaltyCalculationRuleRepository.create(newEntity);
        return { penaltyCalculationRule: newPCR };
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

    private async checkTypeOfService(typeOfServiceId: number) {
        try {
            await this.rmqService.send
                <
                    ReferenceGetTypeOfService.Request,
                    ReferenceGetTypeOfService.Response
                >
                (ReferenceGetTypeOfService.topic, { id: typeOfServiceId });
        } catch (e) {
            throw new RMQError(TYPE_OF_SERVICE_NOT_EXIST.message, ERROR_TYPE.RMQ, TYPE_OF_SERVICE_NOT_EXIST.status);
        }
    }

}