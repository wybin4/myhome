import { AccountUserInfo, CheckSinglePaymentDocument, DeleteDocumentDetails, GetSinglePaymentDocument, ReferenceGetCommon, ReferenceGetHouse, ReferenceGetSubscribersAllInfo } from "@myhome/contracts";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { SinglePaymentDocumentRepository } from "../single-payment-document.repository";
import { SinglePaymentDocumentEntity } from "../single-payment-document.entity";
import { CalculationState, UserRole } from "@myhome/interfaces";
import { CANT_DELETE_DOCUMENT_DETAILS, CANT_GET_SPD, HOME_NOT_EXIST, MANAG_COMP_NOT_EXIST, RMQException, SUBSCRIBERS_NOT_EXIST } from "@myhome/constants";
import { GetSinglePaymentDocumentSaga } from "../sagas/get-single-payment-document.saga";
import { PdfService } from "./pdf.service";
import { ISpdHouse, ISpdManagementCompany } from "../interfaces/subscriber.interface";
import { ISpd } from "../interfaces/single-payment-document.interface";

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
        const gettedSpd = new SinglePaymentDocumentEntity(singlePaymentDocument).get();
        return { singlePaymentDocument: gettedSpd };
    }

    async getSinglePaymentDocument(dto: GetSinglePaymentDocument.Request): Promise<string> {
        const { house } = await this.getHouse(dto.houseId);
        const spdHouse: ISpdHouse = {
            livingArea: house.livingArea, noLivingArea: house.noLivingArea, commonArea: house.commonArea
        }

        const { profile: managementC } = await this.getManagementC(dto.managementCompanyId);
        const spdManagementC: ISpdManagementCompany = {
            name: managementC.name, address: 'address', phone: 'phone', email: managementC.email,
        }

        let { subscribers } = (await this.getSubscribers(dto.subscriberIds));
        if (!subscribers.length) {
            throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
        }
        subscribers = subscribers.map(obj => {
            obj.name = obj.name.toUpperCase();
            return obj;
        })
        const subscriberIds = subscribers.map(obj => obj.id);

        const SPDEntities: SinglePaymentDocumentEntity[] = [];
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
            this.rmqService,
            subscriberIds,
            dto.managementCompanyId,
            dto.houseId
        );

        const { typesOfService, units } = await this.getCommon();

        const { detailIds, detailsInfo, singlePaymentDocuments: singlePaymentDocumentsWithAmount } =
            await saga.getState().calculateDetails(
                subscriberIds, typesOfService, units, dto.managementCompanyId, dto.houseId
            );
        await this.singlePaymentDocumentRepository.updateMany(singlePaymentDocumentsWithAmount);

        // По subscriberIds получаем все их spdIds
        const subscriberSPDs = await this.singlePaymentDocumentRepository.getSPDIdsBySubscriberIds(subscriberIds);
        try {
            const { singlePaymentDocuments: singlePaymentDocumentsWithDebtAndPenalty } =
                await saga.getState().calculateDebtAndPenalty(
                    subscriberSPDs, dto.keyRate
                );
            await this.singlePaymentDocumentRepository
                .updateMany(singlePaymentDocumentsWithDebtAndPenalty);

            const monthOptions = {
                year: 'numeric',
                month: 'long',
                timezone: 'UTC'
            } as const;

            const SPDs: ISpd[] = singlePaymentDocumentsWithDebtAndPenalty.map(obj => {
                let monthName = obj.createdAt.toLocaleString("ru", monthOptions);
                const splitted = monthName.split("")
                const first = splitted[0].toUpperCase();
                const rest = [...splitted];
                rest.splice(0, 1);
                monthName = [first, ...rest].join("");

                return {
                    month: monthName,
                    amount: this.pdfService.getFixedNumber(obj.amount),
                    penalty: this.pdfService.getFixedNumber(obj.penalty),
                    deposit: 0, // ИСПРАВИТЬ!!!
                    debt: this.pdfService.getFixedNumber(obj.debt),
                    subscriberId: obj.subscriberId
                };
            });

            return (await this.pdfService.generatePdf(
                spdHouse, spdManagementC, subscribers,
                detailsInfo,
                SPDs
            )).toString('binary');
        }
        catch (e) {
            await this.revertCalculateDetails(detailIds);
            throw new RMQException(e.message, e.status);
        }
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

    private async getHouse(houseId: number) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetHouse.Request,
                    ReferenceGetHouse.Response
                >
                (ReferenceGetHouse.topic, { id: houseId });
        } catch (e) {
            throw new RMQException(HOME_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
    }

    private async getManagementC(managementCId: number) {
        try {
            return await this.rmqService.send
                <
                    AccountUserInfo.Request,
                    AccountUserInfo.Response
                >
                (AccountUserInfo.topic, { id: managementCId, role: UserRole.ManagementCompany });
        } catch (e) {
            throw new RMQException(MANAG_COMP_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
    }

    private async getSubscribers(subscriberIds: number[]): Promise<ReferenceGetSubscribersAllInfo.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetSubscribersAllInfo.Request,
                    ReferenceGetSubscribersAllInfo.Response
                >
                (ReferenceGetSubscribersAllInfo.topic, { ids: subscriberIds });
        } catch (e) {
            throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
        }
    }

    private async getCommon(): Promise<ReferenceGetCommon.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetCommon.Request,
                    ReferenceGetCommon.Response
                >
                (ReferenceGetCommon.topic, {});
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }
}