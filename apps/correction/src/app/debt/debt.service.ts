import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DebtRepository } from "./debt.repository";
import { CorrectionAddDebt, CorrectionGetDebt, CorrectionUpdateDebt } from "@myhome/contracts";
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

    public async updateDebt(dto: CorrectionUpdateDebt.Request) {
        // Здесь нужно найти соответствующий долг по SPDId
        // Получить новую сумму долга вычитанием из предыдущей debtHistory пришедшей суммы по приоритету
        // Затем в его debtHistory запушить получившуюся сумму с new Date()
    }

    public async addDebt(dto: CorrectionAddDebt.Request) {
        const penaltyRuleGroups = await this.penaltyRuleRepository.findAll();
        if (!penaltyRuleGroups.length) {
            throw new RMQException(PENALTY_RULES_NOT_EXIST.message, PENALTY_RULES_NOT_EXIST.status);
        }
        const penaltyCalcRuleGroups = penaltyRuleGroups.map(obj => obj.penaltyCalculationRules);
        let filteredObjects: { typeOfServiceIds: number[], managementCompanyId: number, _id?: string, priority: number }[] = [];
        for (const level of penaltyCalcRuleGroups) {
            const filteredLevel = level.filter(obj => obj.managementCompanyId === dto.managementCompanyId);
            filteredObjects.push(...filteredLevel);
        }

        const debts: IDebtDetail[] = [];

        const spdAmount = dto.spdAmount.map(obj => obj.amount);
        const totalSPDAmount = spdAmount.reduce((a, b) => a + b, 0);
        let totalDebt = totalSPDAmount - dto.paymentAmount;

        // Проверка, есть ли все типы услуг, поступающие из ЕПД в таблице с правилами расчёта пени
        for (const dd of dto.spdAmount) {
            const current = filteredObjects.find(obj => obj.typeOfServiceIds.includes(dd.typeOfServiceId));
            if (!current) {
                throw new RMQException(
                    PENALTY_CALCULATION_RULES_NOT_CONFIGURED.message(dd.typeOfServiceId),
                    PENALTY_CALCULATION_RULES_NOT_CONFIGURED.status
                );
            }
        }

        filteredObjects = filteredObjects.sort((a, b) => a.priority - b.priority);

        for (const fObject of filteredObjects) {
            const currentSPDAmounts = dto.spdAmount.filter(obj => fObject.typeOfServiceIds.includes(obj.typeOfServiceId));
            const amounts = currentSPDAmounts.map(obj => obj.amount);
            const totalAmount = amounts.reduce((a, b) => a + b, 0);

            debts.push({
                penaltyRuleId: fObject._id,
                amount: totalDebt > 0 ? totalAmount - totalDebt : 0
            })
            totalDebt -= totalAmount;
        }

        const debt = {
            singlePaymentDocumentId: dto.singlePaymentDocumentId,
            debtHistory: [{
                outstandingDebt: debts,
                date: new Date()
            }],
            originalDebt: debts,
            createdAt: new Date(),
        };
        const newDebtEntity = new DebtEntity(debt);
        const newDebt = await this.debtRepository.create(newDebtEntity);

        return { debt: newDebt }
    }
}