import { Injectable } from "@nestjs/common";
import { PenaltyRuleRepository } from "../repositories/penalty-rule.repository";
import { RMQException, PENALTY_RULE_NOT_EXIST, PENALTY_CALCULATION_WITH_PRIORITY_ALREADY_EXIST, checkUser, TYPES_OF_SERVICE_NOT_EXIST } from "@myhome/constants";
import { CorrectionAddPenaltyCalculationRule, ReferenceGetAllTypesOfService, ReferenceGetTypesOfService } from "@myhome/contracts";
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

    public async getPenaltyCalculationRulesByMCId(managementCompanyId: number) {
        await checkUser(this.rmqService, managementCompanyId, UserRole.ManagementCompany);

        const { typesOfService } = await this.getTypesOfService();

        const rules = await this.penaltyRuleRepository.findByMCId(managementCompanyId);
        return {
            penaltyRules: rules.reduce((accumulator, rule) => {
                const currentMCId = rule.penaltyCalculationRules.find(
                    (r) => r.managementCompanyId === managementCompanyId
                );

                const ruleItems = currentMCId
                    ? currentMCId.typeOfServiceIds.map((item) => {
                        const currentTypeOfService = typesOfService.find((tos) => tos.id === item);
                        return {
                            penaltyRuleId: rule.id,
                            description: rule.description,
                            typeOfServiceName: currentTypeOfService.name,
                            typeOfServiceId: currentTypeOfService.id,
                            priority: currentMCId.priority,
                        };
                    })
                    : [];

                return accumulator.concat(ruleItems);
            }, []),
        };

    }

    public async addPenaltyCalculationRule(dto: CorrectionAddPenaltyCalculationRule.Request) {
        const penaltyRule = await this.penaltyRuleRepository.findById(dto.penaltyRuleId);
        if (!penaltyRule) {
            throw new RMQException(PENALTY_RULE_NOT_EXIST.message, PENALTY_RULE_NOT_EXIST.status);
        }
        await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
        const { typesOfService } = await this.checkTypesOfService(dto.typeOfServiceIds);
        if (!typesOfService && !typesOfService.length) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
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

    private async getTypesOfService() {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetAllTypesOfService.Request,
                    ReferenceGetAllTypesOfService.Response
                >
                (ReferenceGetAllTypesOfService.topic, {});
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}