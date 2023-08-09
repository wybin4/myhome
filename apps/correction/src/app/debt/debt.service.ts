import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DebtRepository } from "./debt.repository";
import { CorrectionAddDebt, CorrectionGetDebt } from "@myhome/contracts";
import { PenaltyRuleRepository } from "../penalty/repositories/penalty-rule.repository";
import { PENALTY_CALCULATION_RULES_NOT_CONFIGURED, PENALTY_RULES_NOT_EXIST, RMQException } from "@myhome/constants";
import { IDebtDetail } from "@myhome/interfaces";
import { DebtEntity } from "./debt.entity";

@Injectable()
export class DebtService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly debtRepository: DebtRepository,
        private readonly penaltyRuleRepository: PenaltyRuleRepository
    ) { }

    public async getDebt(dto: CorrectionGetDebt.Request) {
        ;
    }

    public async addDebt(dto: CorrectionAddDebt.Request) {
        const penaltyRuleGroups = await this.penaltyRuleRepository.findAll();
        if (!penaltyRuleGroups.length) {
            throw new RMQException(PENALTY_RULES_NOT_EXIST.message, PENALTY_RULES_NOT_EXIST.status);
        }
        const penaltyCalcRuleGroups = penaltyRuleGroups.map(obj => obj.penaltyCalculationRules);
        const filteredObjects: { typeOfServiceIds: number[], managementCompanyId: number, _id?: string }[] = [];
        for (const level of penaltyCalcRuleGroups) {
            const filteredLevel = level.filter(obj => obj.managementCompanyId === dto.managementCompanyId);
            filteredObjects.push(...filteredLevel);
        }

        const debts: IDebtDetail[] = [];

        for (const dd of dto.spdAmount) {
            const current = filteredObjects.find(obj => obj.typeOfServiceIds.includes(dd.typeOfServiceId));
            if (!current) {
                throw new RMQException(
                    PENALTY_CALCULATION_RULES_NOT_CONFIGURED.message(dd.typeOfServiceId),
                    PENALTY_CALCULATION_RULES_NOT_CONFIGURED.status
                );
            }
            const ruleId = current._id;
            const currentDebt = debts.find(obj => obj.penaltyRuleId === ruleId);
            if (!currentDebt) {
                debts.push({
                    penaltyRuleId: ruleId,
                    amount: dd.amount
                })
            } else {
                debts.map(obj => {
                    if (obj.penaltyRuleId === ruleId) {
                        obj.amount += dd.amount;
                    }
                    return obj;
                })
            }
        }

        const debt = {
            singlePaymentDocumentId: dto.singlePaymentDocumentId,
            outstandingDebt: debts,
            originalDebt: debts,
            createdAt: new Date(),
        };
        const newDebtEntity = new DebtEntity(debt);
        const newDebt = await this.debtRepository.create(newDebtEntity);


        return { debt: newDebt }
    }
}