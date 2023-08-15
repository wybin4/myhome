import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { AccountUserInfo, CorrectionAddPenaltyCalculationRule, CorrectionGetPenalty, ReferenceGetTypesOfService } from "@myhome/contracts";
import { CANT_DIVIDE_INTO_RULE_DIVIDER, CANT_GET_CURRENT_RULE, CANT_GET_KEY_RATE, MANAG_COMP_NOT_EXIST, PENALTY_CALCULATION_WITH_PRIORITY_ALREADY_EXIST, PENALTY_RULE_NOT_EXIST, RMQException } from "@myhome/constants";
import { IDebt, IDebtDetail, IPenaltyRule, IPenaltyRuleDetail, UserRole } from "@myhome/interfaces";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { PenaltyRuleRepository } from "./repositories/penalty-rule.repository";
import { PenaltyRuleEntity } from "./entities/penalty-rule.entity";
import { DebtRepository } from "../debt/debt.repository";
import { createClientAsync } from 'soap';

@Injectable()
export class PenaltyService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly penaltyRuleRepository: PenaltyRuleRepository,
        private readonly debtRepository: DebtRepository,
    ) { }

    private async getAllPenaltyRules() {
        return await this.penaltyRuleRepository.findAll();
    }

    private async getKeyRates(startDate: Date, endDate: Date): Promise<[{ period: Date, value: number }]> {
        const url = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL';
        const client = await createClientAsync(url);

        const params = {
            fromDate: startDate.toISOString(),
            ToDate: endDate.toISOString(),
        };

        const result = await client.KeyRateXMLAsync(params);

        const keyRates = result[0].KeyRateXMLResult.KeyRate.KR.map((rcdKR) => ({
            period: new Date(Date.parse(rcdKR.DT)),
            value: parseFloat(rcdKR.Rate),
        }));

        return keyRates;
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


    private calculatePenaltyByOneDebt(
        debt: IDebtDetail[],
        penaltyRules: IPenaltyRule[],
        startOfDebt: Date,
        keyRate: number,
        partOfDebt: boolean,
        payedDays?: number
    ) {
        const currentDate = new Date();
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

        const penaltyRules = await this.getAllPenaltyRules();
        const debts: IDebt[] = await this.debtRepository.findMany(dto.debtIds);

        const result = [];

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

            // Получаем ключевую ставку для конкретного долга по его датам
            try {
                keyRateData = await this.getKeyRates(currentDebt.date, new Date());
                keyRate = keyRateData[0].value;
            } catch (e) {
                throw new RMQException(CANT_GET_KEY_RATE.message, CANT_GET_KEY_RATE.status);
            }
            // keyRate = 8.5; // ЗАГЛУШКА

            // По последнему невыплаченному долгу расчитываем пени
            const currentPenalty = this.calculatePenaltyByOneDebt(
                currentDebt.outstandingDebt,
                penaltyRules,
                debt.debtHistory[debt.debtHistory.length - 1].date, keyRate, partOfDebt, payedDays
            );

            result.push({
                penalty: currentPenalty + sumFixedPenalties,
                singlePaymentDocumentId: debt.singlePaymentDocumentId
            });
        }

        return result;
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