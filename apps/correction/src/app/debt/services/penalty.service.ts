import { RMQException, CANT_GET_CURRENT_RULE, CANT_DIVIDE_INTO_RULE_DIVIDER, CANT_GET_KEY_RATE } from "@myhome/constants";
import { IPenaltyRuleDetail, IDebtDetail, IPenaltyRule, IDebtHistory, IGetCorrection, ICalculatedPenalty } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { DebtRepository } from "../repositories/debt.repository";
import { CBRService } from "./cbr.service";
import { PenaltyRuleService } from "./penalty-rule.service";

@Injectable()
export class PenaltyService {
    constructor(
        private readonly debtRepository: DebtRepository,
        private readonly penaltyRuleService: PenaltyRuleService,
        private readonly cbrService: CBRService,
    ) { }

    async getCombinedPenaltyData(subscriberSPDs: IGetCorrection[], keyRate?: number): Promise<{ subscriberId: number; penalty: number; }[]> {
        const penaltyDataByDebts = await this.calculatePenalties(subscriberSPDs, keyRate);
        const penaltyDataByPenalty = await this.getFixedPenalties(subscriberSPDs);

        const combinedPenaltyData = penaltyDataByDebts.map(debtItem => {
            const penaltyItem = penaltyDataByPenalty.find(penaltyItem => penaltyItem.subscriberId === debtItem.subscriberId);
            if (penaltyItem) {
                return {
                    subscriberId: debtItem.subscriberId,
                    penalty: debtItem.penalty + penaltyItem.penalty
                };
            } else {
                return debtItem;
            }
        });

        return combinedPenaltyData;
    }

    // Функция для получения пени по закрытым долгам
    async getFixedPenalties(subscriberSPDs: IGetCorrection[]): Promise<ICalculatedPenalty[]> {
        const subscribersPenalty: ICalculatedPenalty[] = [];
        // Для каждого абонента находим его незакрытые пени по SPDIds
        for (const subscriber of subscriberSPDs) {
            // Т.е. те, где в debtHistory последняя запись ненулевая - outstandingDebt.amount != 0
            const spdsWithNonZeroAmount = await this.debtRepository.findSPDsWithNonZeroPenalty(subscriber.spdIds);
            let penalty = 0;

            // Пени по конкретным ЕПД
            for (const spd of spdsWithNonZeroAmount) {
                if (spd.outstandingPenalty) {
                    penalty += spd.outstandingPenalty;
                }
            }

            // Пени абонента по всем ЕПД
            subscribersPenalty.push({
                subscriberId: subscriber.subscriberId,
                penalty: penalty
            });
        }

        return subscribersPenalty;
    }

    private getCountOfDays(startDate: Date, endDate: Date) {
        const timeDifference = endDate.getTime() - startDate.getTime();
        const daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
        return daysDifference + 1;
    }

    private divideDays(
        inputArray: IPenaltyRuleDetail[],
        totalDays: number,
    ): { divider: number, days: number }[] {
        let currentDay = 1;

        const outputArray: { divider: number, days: number }[] = [];

        for (const inputObj of inputArray) {
            const daysInRange = Math.min(inputObj.end, totalDays) - currentDay + 1;
            outputArray.push({ divider: inputObj.divider, days: daysInRange });
            currentDay += daysInRange;
            if (currentDay > totalDays) {
                break;
            }
        }

        return outputArray;
    }

    private divideDaysWhenItPartOfDebt(
        inputArray: IPenaltyRuleDetail[],
        totalDays: number,
        payedDays: number,
    ): { divider: number; days: number }[] {
        const outputArray: { divider: number; days: number }[] =
            this.divideDays(inputArray, totalDays); // Получаем простое деление по периодам

        let remainingPayedDays = payedDays;

        // Вычитаем из каждого элемента массива с его начала payedDays
        for (let i = 0; i < outputArray.length; i++) {
            if (remainingPayedDays <= 0) { // Если кончились payedDays
                break;
            }

            const daysToSubtract = Math.min(remainingPayedDays, outputArray[i].days);
            outputArray[i].days -= daysToSubtract;
            remainingPayedDays -= daysToSubtract;

            if (outputArray[i].days <= 0) {
                outputArray.splice(i, 1); // Если в периоде не осталось дней, то удаляем его из результата
                i--;
            }
        }

        return outputArray;
    }

    public async getPenaltyByHistory(debtHistory: IDebtHistory, endDate: Date, keyRate?: number) {
        // Получаем все правила вычисления пени
        const penaltyRules = await this.penaltyRuleService.getAllPenaltyRules();
        // Получаем ключевую ставку
        if (!keyRate) {
            try {
                keyRate = await this.cbrService.getKeyRate({
                    startDate: debtHistory.date,
                    endDate: new Date()
                });
            } catch (e) {
                throw new RMQException(CANT_GET_KEY_RATE.message, CANT_GET_KEY_RATE.status);
            }
        }

        return this.calculatePenaltyByOneDebt(
            debtHistory.outstandingDebt,
            penaltyRules,
            debtHistory.date,
            endDate,
            keyRate,
            false
        );
    }

    private calculatePenaltyByOneDebt(
        debt: IDebtDetail[],
        penaltyRules: IPenaltyRule[],
        startOfDebt: Date,
        endOfDebt: Date,
        keyRate: number,
        partOfDebt: boolean,
        payedDays?: number
    ): number {
        const currentDate = endOfDebt;
        const difference = this.getCountOfDays(startOfDebt, currentDate);
        let penalty = 0, dividers: { divider: number, days: number }[];

        for (const oDebt of debt) {
            const rule = penaltyRules.find(obj => {
                return String(obj._id) === String(oDebt.penaltyRuleId);
            });
            if (!rule) {
                throw new RMQException(CANT_GET_CURRENT_RULE.message(oDebt.penaltyRuleId), CANT_GET_CURRENT_RULE.status);
            }
            const currentRule = rule.penaltyRule;
            // Если это часть долга, т.е. по долгу уже были выплаты
            if (!partOfDebt) {
                dividers = this.divideDays(currentRule, difference); // Делим по периодам
            } else { // Если выплат по долгу не было
                dividers = this.divideDaysWhenItPartOfDebt(currentRule, difference, payedDays);
            }
            if (dividers) {
                for (const divider of dividers) {
                    if (divider.divider != 0) { // По каждому периоду вычисляем пени
                        penalty += (oDebt.amount * keyRate * divider.days) / (100 * divider.divider);
                    }
                }
            } else {
                throw new RMQException(CANT_DIVIDE_INTO_RULE_DIVIDER.message, CANT_DIVIDE_INTO_RULE_DIVIDER.status);
            }
        }

        return penalty;
    }

    async calculatePenalties(subscriberSPDs: IGetCorrection[], keyRate?: number): Promise<{ subscriberId: number; penalty: number }[]> {
        const subscribersPenalty: { subscriberId: number; penalty: number }[] = [];

        // Получаем правила расчёта пени
        const penaltyRules = await this.penaltyRuleService.getAllPenaltyRules();

        // Получаем ключевую ставку
        if (!keyRate) {
            const today = new Date();
            const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
            try {
                keyRate = await this.cbrService.getKeyRate({
                    startDate: lastMonth,
                    endDate: new Date()
                });
            } catch (e) {
                throw new RMQException(CANT_GET_KEY_RATE.message, CANT_GET_KEY_RATE.status);
            }
        }


        // Для каждого абонента находим его незакрытые долги по SPDIds
        for (const subscriber of subscriberSPDs) {
            const spdsWithNonZeroAmount = await this.debtRepository.findSPDsWithDebtHistory(subscriber.spdIds);
            let penalty = 0;

            for (const spd of spdsWithNonZeroAmount) {
                const temp = await this.calculatePenalty(spd.debtHistory, penaltyRules, keyRate);
                if (temp) {
                    penalty += temp;
                }
            }

            // Пени абонента по всем ЕПД
            subscribersPenalty.push({
                subscriberId: subscriber.subscriberId,
                penalty: penalty
            });
        }

        return subscribersPenalty;
    }

    // Функция для расчёта пени по незакрытым долгам
    private async calculatePenalty(
        debtHistory: IDebtHistory[],
        penaltyRules: IPenaltyRule[],
        keyRate: number
    ): Promise<number> {
        let partOfDebt: boolean, payedDays: number
        if (debtHistory.length) {
            // Получаем пени за уже закрытые части долга
            const fixedPenalties = debtHistory.slice(1).map(obj => obj.outstandingPenalty);
            if (!fixedPenalties.length) partOfDebt = false; else {
                payedDays = this.getCountOfDays(
                    debtHistory[debtHistory.length - 1].date,
                    debtHistory[0].date,
                );
                partOfDebt = true;
            }

            // Получаем задолженность для расчитываемой пени
            const currentDebt = debtHistory[0];

            // По последнему невыплаченному долгу расчитываем пени
            const currentPenalty = this.calculatePenaltyByOneDebt(
                currentDebt.outstandingDebt,
                penaltyRules,
                debtHistory[debtHistory.length - 1].date, new Date(), keyRate, partOfDebt, payedDays
            );

            return currentPenalty;
        }
    }
}