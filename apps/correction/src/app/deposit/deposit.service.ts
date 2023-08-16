import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DepositRepository } from "./deposit.repository";
import { CorrectionGetDeposit, CorrectionAddDeposit, CheckSinglePaymentDocument } from "@myhome/contracts";
import { DepositEntity } from "./deposit.entity";
import { RMQException, CANT_GET_SPD, DEPOSIT_NOT_EXIST } from "@myhome/constants";

@Injectable()
export class DepositService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly depositRepository: DepositRepository
    ) { }

    public async getDeposit({ id }: CorrectionGetDeposit.Request) {
        const deposit = await this.depositRepository.findDepositById(id);
        if (!deposit) {
            throw new RMQException(DEPOSIT_NOT_EXIST.message, DEPOSIT_NOT_EXIST.status);
        }
        const gettedDeposit = new DepositEntity(deposit).get();
        return { deposit: gettedDeposit };
    }

    public async addDeposit(dto: CorrectionAddDeposit.Request) {
        await this.checkSPD(dto.singlePaymentDocumentId);

        const newDepositEntity = new DepositEntity(
            {
                singlePaymentDocumentId: dto.singlePaymentDocumentId,
                originalDeposit: dto.paymentAmount - dto.spdAmount,
                outstandingDeposit: dto.paymentAmount - dto.spdAmount,
                createdAt: new Date()
            }
        );
        const newDeposit = await this.depositRepository.createDeposit(newDepositEntity);
        return { deposit: newDeposit };
    }

    private async checkSPD(spdId: number) {
        try {
            await this.rmqService.send
                <
                    CheckSinglePaymentDocument.Request,
                    CheckSinglePaymentDocument.Response
                >
                (CheckSinglePaymentDocument.topic, { id: spdId });
        } catch (e) {
            throw new RMQException(CANT_GET_SPD.message(spdId), CANT_GET_SPD.status);
        }
    }
}