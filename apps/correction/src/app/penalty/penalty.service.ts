import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { PenaltyRepository } from "./penalty.repository";
import { CorrectionGetPenalty } from "@myhome/contracts";

@Injectable()
export class PenaltyService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly penaltyRepository: PenaltyRepository
    ) { }

    public async getPenalty(dto: CorrectionGetPenalty.Request) {
        ;
    }
}