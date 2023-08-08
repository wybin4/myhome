import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DebtRepository } from "./debt.repository";
import { CorrectionGetDebt } from "@myhome/contracts";

@Injectable()
export class DebtService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly debtRepository: DebtRepository
    ) { }

    public async getDebt(dto: CorrectionGetDebt.Request) {
        ;
    }
}