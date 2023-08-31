import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DepositRepository } from "./deposit.repository";
import { CorrectionAddDeposit, CheckSinglePaymentDocument } from "@myhome/contracts";
import { DepositEntity } from "./deposit.entity";
import { RMQException, CANT_GET_SPD } from "@myhome/constants";
import { IGetCorrection } from "@myhome/interfaces";

@Injectable()
export class DepositService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly depositRepository: DepositRepository
    ) { }

    public async getDeposit(subscriberSPDs: IGetCorrection[]) {
        const subscribersDeposit = [];
        // Для каждого абонента находим его неучтенные авансы по SPDIds
        for (const subscriber of subscriberSPDs) {
            // Т.е. те, где в outstandingDeposit
            const depositWithNonZeroOD =
                await this.depositRepository.findWithSpdIdsAndOutstandingDeposit(subscriber.spdIds);
            // Авансы абонента по всем ЕПД
            const deposits = depositWithNonZeroOD.map(obj => obj.outstandingDeposit);
            subscribersDeposit.push({
                subscriberId: subscriber.subscriberId,
                deposit: deposits.reduce((a, b) => a + b, 0)
            });
        }

        return { deposits: subscribersDeposit };
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