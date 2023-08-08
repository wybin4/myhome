import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DepositRepository } from "./deposit.repository";
import { CorrectionGetDeposit } from "@myhome/contracts";

@Injectable()
export class DepositService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly depositRepository: DepositRepository
    ) { }

    public async getDeposit(dto: CorrectionGetDeposit.Request) {
        ;
    }
}