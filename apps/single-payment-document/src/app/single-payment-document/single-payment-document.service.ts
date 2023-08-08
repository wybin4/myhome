import { GetSinglePaymentDocument, ReferenceGetSubscribers } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { SinglePaymentDocumentRepository } from "./single-payment-document.repository";
import { SinglePaymentDocumentEntity } from "./single-payment-document.entity";
import { CalculationState } from "@myhome/interfaces";
import { RMQException, SUBSCRIBERS_NOT_EXIST } from "@myhome/constants";
import { GetSinglePaymentDocumentSaga } from "./sagas/get-single-payment-document.saga";

@Injectable()
export class SinglePaymentDocumentService {
    constructor(
        private readonly rmqSerivce: RMQService,
        private readonly singlePaymentDocumentRepository: SinglePaymentDocumentRepository
    ) { }

    async getSinglePaymentDocument(dto: GetSinglePaymentDocument.Request) {
        const SPDEntities: SinglePaymentDocumentEntity[] = [];
        const { subscribers } = (await this.checkSubscribers(dto.subscriberIds));
        if (!subscribers.length) {
            throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
        }
        const subscriberIds = subscribers.map(obj => obj.id);
        for (const subscriberId of dto.subscriberIds) {
            const SPDEntity =
                new SinglePaymentDocumentEntity({
                    managementCompanyId: dto.managementCompanyId,
                    subscriberId: subscriberId,
                    createdAt: new Date(),
                    status: CalculationState.Started
                });
            SPDEntities.push(SPDEntity);
        }

        const savedSPDEntities = await this.singlePaymentDocumentRepository.createMany(SPDEntities);

        const saga = new GetSinglePaymentDocumentSaga(
            savedSPDEntities,
            this.rmqSerivce,
            subscriberIds,
            dto.managementCompanyId,
            dto.houseId
        );

        const { detailIds, singlePaymentDocuments } = await saga.getState().calculateDetails(
            subscriberIds, dto.managementCompanyId, dto.houseId
        );

        await this.singlePaymentDocumentRepository.updateMany(singlePaymentDocuments);
        return { singlePaymentDocuments: singlePaymentDocuments };
    }

    private async checkSubscribers(subscriberIds: number[]) {
        try {
            return await this.rmqSerivce.send
                <
                    ReferenceGetSubscribers.Request,
                    ReferenceGetSubscribers.Response
                >
                (ReferenceGetSubscribers.topic, { ids: subscriberIds });
        } catch (e) {
            throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
        }
    }
}