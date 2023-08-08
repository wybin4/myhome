import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DebtRepository } from "./debt.repository";
import { CorrectionAddDebt, CorrectionGetDebt } from "@myhome/contracts";
import { PenaltyRuleRepository } from "../penalty/repositories/penalty-rule.repository";

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
        ;
    }
}