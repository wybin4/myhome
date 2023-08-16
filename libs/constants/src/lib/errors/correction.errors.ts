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
export const PENALTY_CALCULATION_WITH_PRIORITY_ALREADY_EXIST = {
    message: (priority: number) => `Правило расчёта пени с приоритетом ${priority} уже существует`,
    status: HttpStatus.BAD_REQUEST
}
export const CANT_GET_KEY_RATE = {
    message: 'Невозможно получить данные о ключевой ставке',
    status: HttpStatus.GATEWAY_TIMEOUT
}
export const CANT_GET_CURRENT_RULE = {
    message: (penaltyRuleId: string) => `Невозможно получить правило расчёта пени с id=${penaltyRuleId}`,
    status: HttpStatus.NOT_FOUND
}
export const CANT_DIVIDE_INTO_RULE_DIVIDER = {
    message: 'Невозможно разделить на этот делитель',
    status: HttpStatus.BAD_GATEWAY
}
export const CANT_GET_DEBT_BY_THIS_SPD_ID = {
    message: (SPDId: number) => `Невозможно получить долг по ЕПД с id=${SPDId}`,
    status: HttpStatus.NOT_FOUND
}
export const PRIORITY_NOT_EXIST = {
    message: 'Для правил расчёта пени не настроен приоритет',
    status: HttpStatus.NOT_FOUND
}
export const DEBT_NOT_EXIST = {
    message: 'Такой долг не существует',
    status: HttpStatus.NOT_FOUND
}
export const DEPOSIT_NOT_EXIST = {
    message: 'Такой аванс не существует',
    status: HttpStatus.NOT_FOUND
}