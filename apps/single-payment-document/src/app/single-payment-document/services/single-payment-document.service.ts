import { CheckSinglePaymentDocument, DeleteDocumentDetails, GetSinglePaymentDocument, ReferenceGetSubscribers } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { SinglePaymentDocumentRepository } from "../single-payment-document.repository";
import { SinglePaymentDocumentEntity } from "../single-payment-document.entity";
import { CalculationState } from "@myhome/interfaces";
import { CANT_DELETE_DOCUMENT_DETAILS, CANT_GET_SPD, RMQException, SUBSCRIBERS_NOT_EXIST } from "@myhome/constants";
import { GetSinglePaymentDocumentSaga } from "../sagas/get-single-payment-document.saga";
import { PdfService } from "./pdf.service";

@Injectable()
export class SinglePaymentDocumentService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly singlePaymentDocumentRepository: SinglePaymentDocumentRepository,
        private readonly pdfService: PdfService
    ) { }

    async checkSinglePaymentDocument({ id }: CheckSinglePaymentDocument.Request) {
        const singlePaymentDocument = await this.singlePaymentDocumentRepository.findSinglePaymentDocumentById(id);
        if (!singlePaymentDocument) {
            throw new RMQException(CANT_GET_SPD.message(id), CANT_GET_SPD.status);
        }
        const gettedHouse = new SinglePaymentDocumentEntity(singlePaymentDocument).get();
        return { singlePaymentDocument: gettedHouse };
    }

    async getSinglePaymentDocument(dto: GetSinglePaymentDocument.Request): Promise<string> {
        return (await this.pdfService.generatePdf()).toString('binary');
        // const SPDEntities: SinglePaymentDocumentEntity[] = [];
        // const { subscribers } = (await this.checkSubscribers(dto.subscriberIds));
        // if (!subscribers.length) {
        //     throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
        // }
        // const subscriberIds = subscribers.map(obj => obj.id);
        // for (const subscriberId of dto.subscriberIds) {
        //     const SPDEntity =
        //         new SinglePaymentDocumentEntity({
        //             managementCompanyId: dto.managementCompanyId,
        //             subscriberId: subscriberId,
        //             createdAt: new Date(),
        //             status: CalculationState.Started
        //         });
        //     SPDEntities.push(SPDEntity);
        // }

        // const savedSPDEntities = await this.singlePaymentDocumentRepository.createMany(SPDEntities);

        // const saga = new GetSinglePaymentDocumentSaga(
        //     savedSPDEntities,
        //     this.rmqService,
        //     subscriberIds,
        //     dto.managementCompanyId,
        //     dto.houseId
        // );

        // const { detailIds, singlePaymentDocuments: singlePaymentDocumentsWithAmount } =
        //     await saga.getState().calculateDetails(
        //         subscriberIds, dto.managementCompanyId, dto.houseId
        //     );
        // await this.singlePaymentDocumentRepository.updateMany(singlePaymentDocumentsWithAmount);

        // // По subscriberIds получаем все их spdIds
        // const subscriberSPDs = await this.singlePaymentDocumentRepository.getSPDIdsBySubscriberIds(subscriberIds);
        // try {
        //     const { singlePaymentDocuments: singlePaymentDocumentsWithDebtAndPenalty } =
        //         await saga.getState().calculateDebtAndPenalty(
        //             subscriberSPDs
        //         );
        //     await this.singlePaymentDocumentRepository.updateMany(singlePaymentDocumentsWithDebtAndPenalty);
        //     return { singlePaymentDocuments: singlePaymentDocumentsWithDebtAndPenalty };
        // }
        // catch (e) {
        //     await this.revertCalculateDetails(detailIds);
        //     throw new RMQException(e.message, e.status);
        // }
    }

    private async revertCalculateDetails(detailIds: number[]) {
        try {
            return await this.rmqService.send
                <
                    DeleteDocumentDetails.Request,
                    DeleteDocumentDetails.Response
                >
                (DeleteDocumentDetails.topic, { detailIds });
        } catch (e) {
            throw new RMQException(CANT_DELETE_DOCUMENT_DETAILS.message, CANT_DELETE_DOCUMENT_DETAILS.status);
        }
    }

    private async checkSubscribers(subscriberIds: number[]) {
        try {
            return await this.rmqService.send
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