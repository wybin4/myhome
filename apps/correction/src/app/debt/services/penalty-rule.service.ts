import { Injectable } from "@nestjs/common";
import { PenaltyRuleRepository } from "../repositories/penalty-rule.repository";
import { RMQException, PENALTY_CALCULATION_ALREADY_EXIST, TYPES_OF_SERVICE_NOT_EXIST, getTypesOfService, getAllTypesOfService, PENALTY_RULES_NOT_EXIST } from "@myhome/constants";
import { CorrectionGetPenaltyCalculationRulesByMCId, CorrectionAddPenaltyCalculationRules, CorrectionGetPenaltyRules, IAddPenaltyCalculationRules } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class PenaltyRuleService {
    constructor(
        private readonly penaltyRuleRepository: PenaltyRuleRepository,
        private readonly rmqService: RMQService
    ) { }

    public async getPenaltyRules(): Promise<CorrectionGetPenaltyRules.Response> {
        const penaltyRules = await this.getAllPenaltyRules();
        return {
            penaltyRules: penaltyRules.map(pr => {
                return {
                    id: pr._id,
                    name: pr.description
                };
            })
        }
    }

    public async getAllPenaltyRules() {
        return await this.penaltyRuleRepository.findAll();
    }

    public async getPenaltyCalculationRulesByMCId(dto: CorrectionGetPenaltyCalculationRulesByMCId.Request):
        Promise<CorrectionGetPenaltyCalculationRulesByMCId.Response> {
        const { typesOfService } = await getAllTypesOfService(this.rmqService);

        const rules = await this.penaltyRuleRepository.findByMCId(dto.managementCompanyId);
        return {
            penaltyRules: rules.reduce((accumulator, rule) => {
                const currentMCId = rule.penaltyCalculationRules.find(
                    (r) => r.managementCompanyId === dto.managementCompanyId
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

    private groupByPriorityAndType(penaltyRules: IAddPenaltyCalculationRules[]) {
        const groupedRules: { priority: number; typeOfServiceIds: number[]; _id: string }[] = [];

        penaltyRules.forEach(rule => {
            const existingGroup = groupedRules.find(group => group.priority === rule.priority);

            if (existingGroup) {
                existingGroup.typeOfServiceIds.push(rule.typeOfServiceId);
            } else {
                groupedRules.push({
                    priority: rule.priority,
                    typeOfServiceIds: [rule.typeOfServiceId],
                    _id: rule.penaltyRuleId
                });
            }
        });

        return groupedRules;
    }

    public async addPenaltyCalculationRules(dto: CorrectionAddPenaltyCalculationRules.Request) {
        const penaltyRuleIds = dto.penaltyRules.flatMap(pr => pr.penaltyRuleId);
        const penaltyRules = await this.penaltyRuleRepository.findManyById(penaltyRuleIds);
        if (!penaltyRules && !penaltyRules.length) {
            throw new RMQException(PENALTY_RULES_NOT_EXIST.message, PENALTY_RULES_NOT_EXIST.status);
        }
        const typesOfServiceId = dto.penaltyRules.flatMap(pr => pr.typeOfServiceId);
        const { typesOfService } = await getTypesOfService(this.rmqService, typesOfServiceId);
        if (!typesOfService && !typesOfService.length) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
        const grouped = this.groupByPriorityAndType(dto.penaltyRules);

        const result = await this.penaltyRuleRepository.findByManagementCIDAndPriority(dto.managementCompanyId, grouped);

        if (result) {
            throw new RMQException(PENALTY_CALCULATION_ALREADY_EXIST.message, PENALTY_CALCULATION_ALREADY_EXIST.status);
        }


        await this.penaltyRuleRepository.updateMany(
            grouped.map(g => {
                return { ...g, managementCompanyId: dto.managementCompanyId };
            }),
        );

        const rules = await this.penaltyRuleRepository.findByMCId(dto.managementCompanyId);
        return {
            penaltyRules: rules.reduce((accumulator, rule) => {
                const currentMCId = rule.penaltyCalculationRules.find(
                    (r) => r.managementCompanyId === dto.managementCompanyId
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

}