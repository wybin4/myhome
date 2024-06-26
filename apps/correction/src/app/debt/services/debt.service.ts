import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DebtRepository } from "../repositories/debt.repository";
import { CorrectionAddDebts, CorrectionGetDebts, CorrectionCalculateDebts, CorrectionUpdateDebt, IAddDebt, GetSinglePaymentDocumentsByUser, GetMCIdBySPDId, IGetSinglePaymentDocumentsBySId } from "@myhome/contracts";
import { PenaltyRuleRepository } from "../repositories/penalty-rule.repository";
import { CANT_GET_DEBT_BY_THIS_SPD_ID, CANT_GET_KEY_RATE, PENALTY_CALCULATION_RULES_NOT_CONFIGURED, PENALTY_RULES_NOT_EXIST, PRIORITY_NOT_EXIST, RMQException } from "@myhome/constants";
import { IDebtDetail, IDebtHistory, IGetCorrection, IPenaltyCalculationRule, UserRole } from "@myhome/interfaces";
import { DebtEntity } from "../entities/debt.entity";
import { PenaltyService } from "./penalty.service";
import { Debt } from "../models/debt.model";
import { CBRService } from "./cbr.service";

export interface IPriority {
    typeOfServiceIds: number[], managementCompanyId: number, _id?: string, priority: number; penaltyRuleId: string;
}

@Injectable()
export class DebtService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly debtRepository: DebtRepository,
        private readonly penaltyRuleRepository: PenaltyRuleRepository,
        private readonly penaltyService: PenaltyService,
        private readonly cbrService: CBRService,
    ) { }

    public async checkSubscriberDebts(subscriberSPDs: IGetCorrection) {
        return await this.debtRepository.findSPDsWithOutstandingDebt(subscriberSPDs.spdIds);
    }

    public async calculateDebts({ subscriberSPDs }: CorrectionCalculateDebts.Request): Promise<CorrectionCalculateDebts.Response> {
        const subscribersDebt = [];
        // Для каждого абонента находим его незакрытые долги по SPDIds
        for (const subscriber of subscriberSPDs) {
            // Т.е. те, где в debtHistory последняя запись ненулевая - outstandingDebt.amount != 0
            const spdsWithNonZeroAmount = await this.debtRepository.findSPDsWithOutstandingDebt(subscriber.spdIds);
            const debts = [];

            // Долги по одному ЕПД в разных категориях
            for (const spd of spdsWithNonZeroAmount) {
                const amounts = spd.outstandingDebt.map(obj => obj.amount);
                const debt = amounts.reduce((a, b) => a + b, 0);
                debts.push(debt);
            }

            // Долги абонента по всем ЕПД
            subscribersDebt.push({
                subscriberId: subscriber.subscriberId,
                debt: debts.reduce((a, b) => a + b, 0)
            });
        }

        return { debts: subscribersDebt };
    }

    public async getDebts(dto: CorrectionGetDebts.Request): Promise<CorrectionGetDebts.Response> {
        const { singlePaymentDocuments } = await this.getSPDsByOwner(dto.userId);
        if (!singlePaymentDocuments && !singlePaymentDocuments.length) {
            return { debts: [] };
        }
        const spdIds = singlePaymentDocuments.map(s => s.id);
        const debts = await this.debtRepository.findSPDsWithOutstandingDebt(spdIds);

        return {
            debts: debts.map(debt => {
                const currentSpd = singlePaymentDocuments.find(
                    spd => spd.id === debt.singlePaymentDocumentId
                ) as IGetSinglePaymentDocumentsBySId;
                return {
                    id: debt.singlePaymentDocumentId,
                    outstandingDebt: debt.outstandingDebt.map(od => od.amount).reduce((a, b) => a + b, 0),
                    createdAt: currentSpd.createdAt,
                    apartmentName: currentSpd.apartmentName
                };
            })
        };
    }

    private async getSPDsByOwner(userId: number) {
        try {
            return await this.rmqService.send<
                GetSinglePaymentDocumentsByUser.Request,
                GetSinglePaymentDocumentsByUser.Response
            >(GetSinglePaymentDocumentsByUser.topic, {
                userId, userRole: UserRole.Owner,
                isNotAllInfo: true
            });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    public async updateDebts(
        debtIds: string[],
        amount: number,
        managementCompanyId: number,
        keyRate: number
    ) {
        const priorities = await this.getPriorityWithId(managementCompanyId);
        const debts = await this.debtRepository.findMany(debtIds);
        let paymentAmount = amount;

        for (const debt of debts) {
            // надо находить остаток после погашения и приступать к дальнейшим долгам
            // если не осталось amount, то break
            // отсортировать debts по дате
            const { amount: remaining } = await this.updateDebtHistory(debt, paymentAmount, keyRate, priorities);
            if (remaining <= 0) {
                break;
            } else paymentAmount = remaining;
        }
        return { debts: debts };
    }

    // Функция уплаты долга или его части
    public async updateDebt(dto: CorrectionUpdateDebt.Request) {
        const { managementCompanyId } = await this.getMCIdBySPDId(dto.singlePaymentDocumentId);
        const priorities = await this.getPriorityWithId(managementCompanyId);
        // Ищем соответствующий долг по SPDId
        const debt = await this.debtRepository.findBySPDId(dto.singlePaymentDocumentId);
        if (!debt) {
            throw new RMQException(
                CANT_GET_DEBT_BY_THIS_SPD_ID.message(dto.singlePaymentDocumentId),
                CANT_GET_DEBT_BY_THIS_SPD_ID.status
            );
        }

        let keyRate = dto.keyRate;
        if (!keyRate) {
            try {
                const today = new Date();
                const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
                keyRate = await this.cbrService.getKeyRate({
                    startDate: lastMonth,
                    endDate: today
                });
            } catch (e) {
                throw new RMQException(CANT_GET_KEY_RATE.message, CANT_GET_KEY_RATE.status);
            }
        }

        // Если есть что-то в массиве debt.debtHistory
        if (debt.debtHistory.length) {
            return { debt: (await this.updateDebtHistory(debt, dto.amount, keyRate, priorities)).debt };
        } else return { debt: [] };
    }

    private async getMCIdBySPDId(singlePaymentDocumentId: number) {
        try {
            return await this.rmqService.send<
                GetMCIdBySPDId.Request,
                GetMCIdBySPDId.Response
            >(GetMCIdBySPDId.topic, { id: singlePaymentDocumentId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async updateDebtHistory(
        debt: Debt,
        amount: number, keyRate: number,
        priorities: {
            _id: string;
            penaltyCalculationRules: IPenaltyCalculationRule;
        }[]) {
        const newDebt: IDebtDetail[] = [];

        // Для предыдущей суммы долга вычисляем и фиксируем пени
        const lastDebtInHis: IDebtHistory = JSON.parse(JSON.stringify(debt.debtHistory[0]));
        lastDebtInHis.date = new Date(lastDebtInHis.date);
        let penalty: number;
        try {
            penalty = await this.penaltyService.getPenaltyByHistory(lastDebtInHis, new Date(), keyRate);
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
        debt.debtHistory[0].originalPenalty = penalty;
        debt.debtHistory[0].outstandingPenalty = penalty;

        // Получить новую сумму долга вычитанием из предыдущей debtHistory пришедшей суммы по приоритету
        const lastDebtState: IDebtDetail[] = JSON.parse(JSON.stringify(debt.debtHistory[0].outstandingDebt));
        let paymentAmount = amount;
        for (const priority of priorities) {
            const oldDebt = lastDebtState.find(obj => {
                return String(obj.penaltyRuleId) === String(priority._id)
            });
            if (oldDebt && paymentAmount > 0) {
                let currAmount = oldDebt.amount;
                const prevAmount = oldDebt.amount;
                currAmount -= paymentAmount;
                if (currAmount < 0) {
                    currAmount = 0;
                }
                paymentAmount -= prevAmount;
                newDebt.push({
                    amount: currAmount,
                    penaltyRuleId: priority._id
                });
            } else if (paymentAmount <= 0 && oldDebt) newDebt.push({ ...oldDebt });
        }

        // Затем в его debtHistory запушить получившуюся сумму с new Date()
        debt.debtHistory.unshift({
            outstandingDebt: newDebt,
            date: new Date(),
        });
        // Сохраняем модель
        await debt.save();
        return { debt: debt, amount: paymentAmount };
    }

    private async getPriority(managementCompanyId: number) {
        const penaltyRuleGroups = await this.penaltyRuleRepository.findAll();
        if (!penaltyRuleGroups.length) {
            throw new RMQException(PENALTY_RULES_NOT_EXIST.message, PENALTY_RULES_NOT_EXIST.status);
        }
        const penaltyCalcRuleGroups = penaltyRuleGroups.map(obj => { return { penaltyCalcRule: obj.penaltyCalculationRules, id: obj._id }; });
        const filteredObjects: { typeOfServiceIds: number[], managementCompanyId: number, _id?: string, priority: number; penaltyRuleId: string }[] = [];
        for (const level of penaltyCalcRuleGroups) {
            const filteredLevel = level.penaltyCalcRule.find(obj => obj.managementCompanyId === managementCompanyId);
            if (filteredLevel) {
                filteredObjects.push({
                    typeOfServiceIds: filteredLevel.typeOfServiceIds,
                    managementCompanyId: filteredLevel.managementCompanyId,
                    priority: filteredLevel.priority,
                    penaltyRuleId: level.id,
                });
            }
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


    public async addDebts(dto: CorrectionAddDebts.Request): Promise<CorrectionAddDebts.Response> {
        const priorities = await this.getPriority(dto.managementCompanyId);
        if (!priorities.length) {
            throw new RMQException(PRIORITY_NOT_EXIST.message, PRIORITY_NOT_EXIST.status);
        }

        const newDebtEntities = dto.spds.map(spd => {
            const debt = this.getDebtForAdding(spd, priorities);
            return new DebtEntity(debt);
        });

        const debts = await this.debtRepository.createMany(newDebtEntities);
        return { debts }
    }

    private getDebtForAdding(spd: IAddDebt, priorities: IPriority[]) {
        const debts: IDebtDetail[] = [];

        // Проверка, есть ли все типы услуг, поступающие из ЕПД в таблице с правилами расчёта пени
        for (const dd of spd.spdAmount) {
            const current = priorities.find(obj => obj.typeOfServiceIds.includes(dd.typeOfServiceId));
            if (!current) {
                throw new RMQException(
                    PENALTY_CALCULATION_RULES_NOT_CONFIGURED.message(dd.typeOfServiceId),
                    PENALTY_CALCULATION_RULES_NOT_CONFIGURED.status
                );
            }
        }

        priorities = priorities.sort((a, b) => a.priority - b.priority);

        for (const fObject of priorities) {
            const currentSPDAmounts = spd.spdAmount.filter(obj => fObject.typeOfServiceIds.includes(obj.typeOfServiceId));
            const amounts = currentSPDAmounts.map(obj => obj.amount);
            const totalAmount = amounts.reduce((a, b) => a + b, 0);
            debts.push({
                penaltyRuleId: fObject.penaltyRuleId,
                amount: totalAmount
            })
        }

        const debt = {
            singlePaymentDocumentId: spd.singlePaymentDocumentId,
            debtHistory: [{
                outstandingDebt: debts,
                date: new Date()
            }],
            originalDebt: debts,
            createdAt: new Date(),
        };

        return debt;
    }

}