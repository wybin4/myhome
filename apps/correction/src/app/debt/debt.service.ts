import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { DebtRepository } from "./debt.repository";
import { AccountUserInfo, CorrectionAddDebt, CorrectionGetDebt, CorrectionUpdateDebt } from "@myhome/contracts";
import { PenaltyRuleRepository } from "../penalty/repositories/penalty-rule.repository";
import { CANT_GET_DEBT_BY_THIS_SPD_ID, MANAG_COMP_NOT_EXIST, PENALTY_CALCULATION_RULES_NOT_CONFIGURED, PENALTY_RULES_NOT_EXIST, PRIORITY_NOT_EXIST, RMQException } from "@myhome/constants";
import { IDebtDetail, IPenaltyCalculationRule, UserRole } from "@myhome/interfaces";
import { DebtEntity } from "./debt.entity";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { ObjectId } from "typeorm";

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

    // Функция уплаты долга или его части
    public async updateDebt(dto: CorrectionUpdateDebt.Request) {
        // Ищем соответствующий долг по SPDId
        // ПРОВЕРКА SPDID!!!!!!!!!!!
        const debt = await this.debtRepository.findBySPDId(dto.singlePaymentDocumentId);
        if (!debt) {
            throw new RMQException(
                CANT_GET_DEBT_BY_THIS_SPD_ID.message(dto.singlePaymentDocumentId),
                CANT_GET_DEBT_BY_THIS_SPD_ID.status
            );
        }

        let paymentAmount = dto.amount;
        const newDebt: IDebtDetail[] = [];

        // Получить новую сумму долга вычитанием из предыдущей debtHistory пришедшей суммы по приоритету
        await this.checkManagementCompany(dto.managementCompanyId);
        const priorities = await this.getPriorityWithId(dto.managementCompanyId);
        for (const priority of priorities) {
            const oldDebt = debt.debtHistory[0].outstandingDebt.find(obj => String(obj.penaltyRuleId) === String(priority._id));
            if (oldDebt && paymentAmount > 0) {
                const prevDebt = oldDebt.amount;
                oldDebt.amount -= paymentAmount;
                if (oldDebt.amount < 0) {
                    oldDebt.amount = 0;
                }
                paymentAmount -= prevDebt;
                newDebt.push(oldDebt);
            } else newDebt.push(oldDebt);
        }

        // Затем в его debtHistory запушить получившуюся сумму с new Date()
        debt.debtHistory.unshift({
            outstandingDebt: newDebt,
            date: new Date(),
        });
        await debt.save();
    }

    private async getPriority(managementCompanyId: number) {
        const penaltyRuleGroups = await this.penaltyRuleRepository.findAll();
        if (!penaltyRuleGroups.length) {
            throw new RMQException(PENALTY_RULES_NOT_EXIST.message, PENALTY_RULES_NOT_EXIST.status);
        }
        const penaltyCalcRuleGroups = penaltyRuleGroups.map(obj => obj.penaltyCalculationRules);
        const filteredObjects: { typeOfServiceIds: number[], managementCompanyId: number, _id?: string, priority: number }[] = [];
        for (const level of penaltyCalcRuleGroups) {
            const filteredLevel = level.filter(obj => obj.managementCompanyId === managementCompanyId);
            filteredObjects.push(...filteredLevel);
        }
        return filteredObjects;
    }

    private async getPriorityWithId(managementCompanyId: number) {
        const penaltyRuleGroups = await this.penaltyRuleRepository.findAll();

        if (!penaltyRuleGroups.length) {
            throw new RMQException(PENALTY_RULES_NOT_EXIST.message, PENALTY_RULES_NOT_EXIST.status);
        }
        const penaltyCalcRuleGroups = penaltyRuleGroups.map(obj => {
            return {
                _id: obj._id,
                penaltyCalculationRules: obj.penaltyCalculationRules
            };
        });

        let filteredObjects: {
            _id: string,
            penaltyCalculationRules: IPenaltyCalculationRule
        }[] = [];
        for (const level of penaltyCalcRuleGroups) {
            const filteredLevel = level.penaltyCalculationRules.find(obj => obj.managementCompanyId === managementCompanyId);
            if (filteredLevel) {
                filteredObjects.push({
                    _id: level._id,
                    penaltyCalculationRules: filteredLevel
                });
            }
        }
        if (!filteredObjects.length) {
            throw new RMQException(PRIORITY_NOT_EXIST.message, PRIORITY_NOT_EXIST.status);
        }
        filteredObjects = filteredObjects.sort((a, b) => a.penaltyCalculationRules.priority - b.penaltyCalculationRules.priority);

        return filteredObjects;
    }


    public async addDebt(dto: CorrectionAddDebt.Request) {
        await this.checkManagementCompany(dto.managementCompanyId);
        let filteredObjects = await this.getPriority(dto.managementCompanyId);
        if (!filteredObjects.length) {
            throw new RMQException(PRIORITY_NOT_EXIST.message, PRIORITY_NOT_EXIST.status);
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

    private async checkManagementCompany(managementCompanyId: number) {
        try {
            await this.rmqService.send
                <
                    AccountUserInfo.Request,
                    AccountUserInfo.Response
                >
                (AccountUserInfo.topic, { id: managementCompanyId, role: UserRole.ManagementCompany });
        } catch (e) {
            throw new RMQException(MANAG_COMP_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
    }
}