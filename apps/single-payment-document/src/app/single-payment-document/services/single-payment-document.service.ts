import { AccountUserInfo, CheckSinglePaymentDocument, DeleteDocumentDetails, GetSinglePaymentDocument, ReferenceGetHouses, ReferenceGetSubscribersAllInfo, ReferenceGetSubscriberIdsByHouse, ReferenceGetSubscribersByHouses } from "@myhome/contracts";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { SinglePaymentDocumentRepository } from "../single-payment-document.repository";
import { SinglePaymentDocumentEntity } from "../single-payment-document.entity";
import { CalculationState, ISubscriberAllInfo, ITypeOfService, IUnit, UserRole } from "@myhome/interfaces";
import { CANT_DELETE_DOCUMENT_DETAILS, CANT_GET_SPD, HOUSES_NOT_EXIST, MANAG_COMP_NOT_EXIST, RMQException, SUBSCRIBERS_NOT_EXIST, getCommon } from "@myhome/constants";
import { GetSinglePaymentDocumentSaga } from "../sagas/get-single-payment-document.saga";
import { PdfService } from "./pdf.service";
import { ISpdHouse, ISpdManagementCompany, ISpdSubscriber } from "../interfaces/subscriber.interface";
import { ISpd, ISpdDetailInfo } from "../interfaces/single-payment-document.interface";
import { ISpdMeterReadings } from "../interfaces/reading-table.interface";

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

    private async getSinglePaymentDocumentForOneHouse(
        subscribers: ISubscriberAllInfo[],
        houseId: number,
        managementCompanyId: number,
        keyRate: number,
        typesOfService: ITypeOfService[], units: IUnit[]
    ) {
        const subscriberIds = subscribers.map(obj => obj.id);

        const SPDEntities: SinglePaymentDocumentEntity[] = [];
        for (const subscriberId of subscriberIds) {
            const SPDEntity =
                new SinglePaymentDocumentEntity({
                    managementCompanyId: managementCompanyId,
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
            managementCompanyId,
            houseId
        );

        const {
            detailIds, detailsInfo,
            meterReadingsData,
            singlePaymentDocuments: singlePaymentDocumentsWithAmount
        } =
            await saga.getState().calculateDetails(
                subscriberIds, typesOfService, units, managementCompanyId, houseId
            );
        await this.singlePaymentDocumentRepository.updateMany(singlePaymentDocumentsWithAmount);

        // По subscriberIds получаем все их spdIds
        const subscriberSPDs = await this.singlePaymentDocumentRepository.getSPDIdsBySubscriberIds(subscriberIds);
        try {
            const { singlePaymentDocuments: singlePaymentDocumentsWithCorrection } =
                await saga.getState().calculateCorrection(
                    subscriberSPDs, keyRate
                );
            await this.singlePaymentDocumentRepository
                .updateMany(singlePaymentDocumentsWithCorrection);

            const monthOptions = {
                year: 'numeric',
                month: 'long',
                timezone: 'UTC'
            } as const;

            const SPDs: ISpd[] = singlePaymentDocumentsWithCorrection.map(obj => {
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
                    deposit: this.pdfService.getFixedNumber(obj.deposit),
                    debt: this.pdfService.getFixedNumber(obj.debt),
                    subscriberId: obj.subscriberId
                };
            });

            return { SPDs, detailsInfo, meterReadingsData };
        } catch (e) {
            await this.revertCalculateDetails(detailIds);
            throw new RMQException(e.message, e.status);
        }
    }

    async getSinglePaymentDocument(dto: GetSinglePaymentDocument.Request): Promise<string> {
        const { profile: managementC } = await this.getManagementC(dto.managementCompanyId);
        const spdManagementC: ISpdManagementCompany = {
            name: managementC.name, address: 'address', phone: 'phone', email: managementC.email,
        }

        const allDetailsInfo: ISpdDetailInfo[] = [];
        const allSPDs: ISpd[] = [];
        const allMeterReadings: ISpdMeterReadings[] = [];

        const { typesOfService, units } = await getCommon(this.rmqService);

        if (dto.houseIds) {
            const spdHouses: ISpdHouse[] = [];
            const subscribers: ISpdSubscriber[] = [];

            const { houses } = await this.getSubscribersByHouses(dto.houseIds);

            for (const house of houses) {
                const { detailsInfo, SPDs, meterReadingsData } =
                    await this.getSinglePaymentDocumentForOneHouse(
                        house.subscribers, house.house.id,
                        dto.managementCompanyId, dto.keyRate,
                        typesOfService, units
                    );

                spdHouses.push({
                    id: house.house.id, livingArea: house.house.livingArea,
                    noLivingArea: house.house.noLivingArea,
                    commonArea: house.house.commonArea
                });

                const modifiedSubscribers: ISpdSubscriber[] =
                    house.subscribers.map(subscriber => ({
                        ...subscriber,
                        name: subscriber.name.toUpperCase(),
                    }));
                subscribers.push(...modifiedSubscribers);

                allDetailsInfo.push(...detailsInfo);
                allSPDs.push(...SPDs);
                allMeterReadings.push(...meterReadingsData);
            }

            return (await this.pdfService.generatePdfByHouses(
                spdHouses, spdManagementC, subscribers,
                allDetailsInfo,
                allSPDs, allMeterReadings,
            )).toString('binary');
        } else if (dto.subscriberIds) {
            let { subscribers } = (await this.getSubscribers(dto.subscriberIds));
            if (!subscribers.length) {
                throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
            }
            subscribers = subscribers.map(obj => {
                obj.name = obj.name.toUpperCase();
                return obj;
            });

            const houseIds = subscribers.map(s => s.houseId);
            const { houses } = await this.getHouses(houseIds);

            for (const house of houses) {
                const currentSubscribers = subscribers.filter(s => s.houseId === house.id);
                const { detailsInfo, SPDs, meterReadingsData } =
                    await this.getSinglePaymentDocumentForOneHouse(
                        currentSubscribers, house.id,
                        dto.managementCompanyId, dto.keyRate,
                        typesOfService, units
                    );

                allDetailsInfo.push(...detailsInfo);
                allSPDs.push(...SPDs);
                allMeterReadings.push(...meterReadingsData);
            }

            return (await this.pdfService.generatePdfByHouses(
                houses, spdManagementC, subscribers,
                allDetailsInfo,
                allSPDs, allMeterReadings,
            )).toString('binary');
        }
        else {
            throw new RMQException("Не было переданы ни houseIds, ни subscriberIds", HttpStatus.BAD_REQUEST);
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

    private async getSubscribersByHouses(houseIds: number[]) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetSubscribersByHouses.Request,
                    ReferenceGetSubscribersByHouses.Response
                >
                (ReferenceGetSubscriberIdsByHouse.topic, { houseIds });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getHouses(houseIds: number[]) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetHouses.Request,
                    ReferenceGetHouses.Response
                >
                (ReferenceGetHouses.topic, { houseIds });
        } catch (e) {
            throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
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
}