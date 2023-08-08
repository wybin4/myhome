import { HttpStatus } from "@nestjs/common";

export const PENALTY_RULE_NOT_EXIST = {
    message: 'Такое правило расчёта пени не существует',
    status: HttpStatus.NOT_FOUND
}