import { RMQException, CANT_GET_CURRENT_RULE, CANT_DIVIDE_INTO_RULE_DIVIDER, CANT_GET_KEY_RATE } from "@myhome/constants";
import { CorrectionGetPenalty } from "@myhome/contracts";
import { IPenaltyRuleDetail, IDebtDetail, IPenaltyRule, IDebt } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { DebtRepository } from "../../debt/debt.repository";
import { CBRService } from "./cbr.service";
import { PenaltyRuleService } from "./penalty-rule.service";

@Injectable()
export class PenaltyService {
    constructor(
        private readonly debtRepository: DebtRepository,
        private readonly penaltyRuleService: PenaltyRuleService,
        private readonly cbrService: CBRService,
    ) { }

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

    public calculatePenaltyByOneDebt(
        debt: IDebtDetail[],
        penaltyRules: IPenaltyRule[],
        startOfDebt: Date,
        endOfDebt: Date,
        keyRate: number,
        partOfDebt: boolean,
        payedDays?: number
    ) {
        const currentDate = endOfDebt;
        const difference = this.getCountOfDays(startOfDebt, currentDate);
        let penalty = 0, dividers: { divider: number, days: number }[];

        for (const oDebt of debt) {
            const currentRule = penaltyRules.find(obj => String(obj._id) === oDebt.penaltyRuleId).penaltyRule;
            if (!currentRule) {
                throw new RMQException(CANT_GET_CURRENT_RULE.message(oDebt.penaltyRuleId), CANT_GET_CURRENT_RULE.status);
            }
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

    public async getPenalty(dto: CorrectionGetPenalty.Request) {
        let keyRateData: [{ period: Date, value: number }];
        let keyRate: number, partOfDebt: boolean, payedDays: number;

        const penaltyRules = await this.penaltyRuleService.getAllPenaltyRules();
        const debts: IDebt[] = await this.debtRepository.findMany(dto.debtIds);

        const result = [];
        const today = new Date();
        const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
        // keyRate = 8.5; // ЗАГЛУШКА
        // Получаем ключевую ставку
        try {
            keyRateData = await this.cbrService.getKeyRates(lastMonth, today);
            keyRate = keyRateData[0].value;
        } catch (e) {
            throw new RMQException(CANT_GET_KEY_RATE.message, CANT_GET_KEY_RATE.status);
        }

        for (const debt of debts) {
            // Получаем пени за уже закрытые части долга
            const fixedPenalties = debt.debtHistory.slice(1).map(obj => obj.outstandingPenalty);
            if (!fixedPenalties.length) partOfDebt = false; else {
                payedDays = this.getCountOfDays(
                    debt.debtHistory[debt.debtHistory.length - 1].date,
                    debt.debtHistory[0].date,
                );
                partOfDebt = true;
            }
            const sumFixedPenalties = fixedPenalties.reduce((a, b) => a + b, 0);
            // Получаем задолженность для расчитываемой пени
            const currentDebt = debt.debtHistory[0];

            // По последнему невыплаченному долгу расчитываем пени
            const currentPenalty = this.calculatePenaltyByOneDebt(
                currentDebt.outstandingDebt,
                penaltyRules,
                debt.debtHistory[debt.debtHistory.length - 1].date, new Date(), keyRate, partOfDebt, payedDays
            );

            result.push({
                penalty: currentPenalty + sumFixedPenalties,
                singlePaymentDocumentId: debt.singlePaymentDocumentId
            });
        }

        return result;
    }
}