import { HttpStatus } from "@nestjs/common";

export const PENALTY_RULE_NOT_EXIST = {
    message: 'Такое правило расчёта пени не существует',
    status: HttpStatus.NOT_FOUND
}
export const PENALTY_RULES_NOT_EXIST = {
    message: 'Такие правила расчёта пени не существуют',
    status: HttpStatus.NOT_FOUND
}
export const PENALTY_CALCULATION_RULES_NOT_CONFIGURED = {
    message: (typeOfServiceId: number) => `Не настроены правила расчёта пени для услуги с id=${typeOfServiceId}`,
    status: HttpStatus.BAD_REQUEST
}