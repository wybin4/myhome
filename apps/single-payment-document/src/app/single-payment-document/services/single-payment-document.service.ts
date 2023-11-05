import { CheckSinglePaymentDocument, DeleteDocumentDetails, GetSinglePaymentDocument, GetSinglePaymentDocumentsByMCId, GetSinglePaymentDocumentsBySId, ISubscriberAllInfo, ReferenceGetSubscribersByHouses } from "@myhome/contracts";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { SinglePaymentDocumentEntity } from "../entities/single-payment-document.entity";
import { CalculationState, ITypeOfService, IUnit, UserRole } from "@myhome/interfaces";
import { CANT_DELETE_DOCUMENT_DETAILS, CANT_GET_SPD, CANT_GET_SPDS, RMQException, SUBSCRIBERS_NOT_EXIST, checkUser, getApartmentsAllInfo, getCommon, getHouses, getHousesByMCId, getSubscribersAllInfo } from "@myhome/constants";
import { GetSinglePaymentDocumentSaga } from "../sagas/get-single-payment-document.saga";
import { PdfService } from "./pdf.service";
import { ISpdHouse, ISpdManagementCompany, ISpdSubscriber } from "../interfaces/subscriber.interface";
import { ISpd, ISpdDetailInfo } from "../interfaces/single-payment-document.interface";
import { ISpdMeterReadings } from "../interfaces/reading-table.interface";
import { SinglePaymentDocumentTotalRepository } from "../repositories/total.repository";
import { SinglePaymentDocumentTotalEntity } from "../entities/total.entity";
import { SinglePaymentDocumentRepository } from "../repositories/single-payment-document.repository";

@Injectable()
export class SinglePaymentDocumentService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly singlePaymentDocumentRepository: SinglePaymentDocumentRepository,
        private readonly totalRepository: SinglePaymentDocumentTotalRepository,
        private readonly pdfService: PdfService
    ) { }

    async getSinglePaymentDocumentsByMCId(dto: GetSinglePaymentDocumentsByMCId.Request):
        Promise<GetSinglePaymentDocumentsByMCId.Response> {
        await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
        const { houses } = await getHousesByMCId(this.rmqService, dto.managementCompanyId);
        const spds = await this.totalRepository.findByMCId(dto.managementCompanyId);
        if (!spds) {
            throw new RMQException(CANT_GET_SPDS.message, CANT_GET_SPDS.status);
        }

        const files = spds.map(s => {
            return {
                id: s.id,
                fileName: s.path
            };
        });

        const readFiles = await this.pdfService.readFileToBuffer(files);

        return {
            singlePaymentDocuments: readFiles.map(file => {
                const currentSPD = spds.find(s => s.id === file.id);
                const currentHouse = houses.find(h => h.managementCompanyId === currentSPD.managementCompanyId);

                return {
                    id: currentSPD.id,
                    houseId: currentHouse.id,
                    city: currentHouse.city,
                    street: currentHouse.street,
                    houseName: currentHouse.houseNumber,
                    fileSize: file.size,
                    pdfBuffer: (file.buffer).toString('base64'),
                    createdAt: currentSPD.createdAt
                };
            })
        };
    }

    async getSinglePaymentDocumentsBySId(dto: GetSinglePaymentDocumentsBySId.Request):
        Promise<GetSinglePaymentDocumentsBySId.Response> {
        const { apartments } = await getApartmentsAllInfo(this.rmqService, dto.subscriberIds);
        const spds = await this.singlePaymentDocumentRepository.findBySIds(dto.subscriberIds);
        if (!spds) {
            throw new RMQException(CANT_GET_SPDS.message, CANT_GET_SPDS.status);
        }
        const files = spds.map(s => {
            return {
                id: s.id,
                fileName: s.path
            };
        });

        const readFiles = await this.pdfService.readFileToBuffer(files);

        return {
            singlePaymentDocuments: readFiles.map(file => {
                const currentSPD = spds.find(s => s.id === file.id);
                const currentSubscriber = apartments.find(s => s.subscriberId === currentSPD.subscriberId);

                return {
                    id: currentSPD.id,
                    apartmentName: currentSubscriber.address,
                    fileSize: file.size,
                    pdfBuffer: (file.buffer).toString('base64'),
                    createdAt: currentSPD.createdAt
                };
            })
        };
    }

    async checkSinglePaymentDocument({ id }: CheckSinglePaymentDocument.Request) {
        const singlePaymentDocument = await this.singlePaymentDocumentRepository.findById(id);
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

            return {
                SPDs, SPDEntities: singlePaymentDocumentsWithCorrection,
                detailsInfo, meterReadingsData
            };
        } catch (e) {
            await this.revertCalculateDetails(detailIds);
            throw new RMQException(e.message, e.status);
        }
    }

    async getSinglePaymentDocument(dto: GetSinglePaymentDocument.Request): Promise<GetSinglePaymentDocument.Response> {
        // проверяем managementCompanyId
        const { profile: managementC } = await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
        const spdManagementC: ISpdManagementCompany = {
            name: managementC.name, address: 'address', phone: 'phone', email: managementC.email,
        }

        const allDetailsInfo: ISpdDetailInfo[] = [];
        const allSPDs: ISpd[] = [];
        const allSPDEntities: SinglePaymentDocumentEntity[] = [];
        const allMeterReadings: ISpdMeterReadings[] = [];

        // получаем виды услуг и единицы измерения
        const { typesOfService, units } = await getCommon(this.rmqService);

        // если ЕПД нужны по домам
        if (dto.houseIds) {
            const spdHouses: ISpdHouse[] = [];
            const subscribers: ISpdSubscriber[] = [];

            // получаем дома и абонентов в них
            const { houses } = await this.getSubscribersByHouses(dto.houseIds);
            for (const house of houses) {
                const { detailsInfo, SPDs, SPDEntities, meterReadingsData } =
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
                allSPDEntities.push(...SPDEntities);
                allMeterReadings.push(...meterReadingsData);
            }

            const { pdfBuffer, fileName } = await this.pdfService.generatePdf(
                spdHouses, spdManagementC, subscribers,
                allDetailsInfo,
                allSPDs, allMeterReadings,
            );

            const newTotalEntity = new SinglePaymentDocumentTotalEntity({
                managementCompanyId: dto.managementCompanyId,
                path: fileName,
                createdAt: new Date()
            });
            await this.totalRepository.create(newTotalEntity);
            return { pdfBuffer: pdfBuffer.toString('binary') };
        } else if (dto.subscriberIds) {
            let { subscribers } = await getSubscribersAllInfo(this.rmqService, dto.subscriberIds);
            if (!subscribers.length) {
                throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
            }
            subscribers = subscribers.map(obj => {
                obj.name = obj.name.toUpperCase();
                return obj;
            });

            const houseIds = subscribers.map(s => s.houseId);
            const { houses } = await getHouses(this.rmqService, houseIds);

            for (const house of houses) {
                const currentSubscribers = subscribers.filter(s => s.houseId === house.id);
                const { detailsInfo, SPDs, SPDEntities, meterReadingsData } =
                    await this.getSinglePaymentDocumentForOneHouse(
                        currentSubscribers, house.id,
                        dto.managementCompanyId, dto.keyRate,
                        typesOfService, units
                    );

                allDetailsInfo.push(...detailsInfo);
                allSPDs.push(...SPDs);
                allSPDEntities.push(...SPDEntities);
                allMeterReadings.push(...meterReadingsData);
            }

            const { pdfBuffer, fileName } = await this.pdfService.generatePdf(
                houses, spdManagementC, subscribers,
                allDetailsInfo,
                allSPDs, allMeterReadings,
            );

            const newTotalEntity = new SinglePaymentDocumentTotalEntity({
                managementCompanyId: dto.managementCompanyId,
                path: fileName,
                createdAt: new Date()
            });
            const total = await this.totalRepository.create(newTotalEntity);
            const totalId = total.id;

            this.generateSubscribersPdf(
                houses, spdManagementC, subscribers,
                allDetailsInfo,
                allSPDs, allSPDEntities,
                allMeterReadings,
                totalId
            );

            return { pdfBuffer: pdfBuffer.toString('binary') };
        }
        else {
            throw new RMQException("Не было переданы ни houseIds, ни subscriberIds", HttpStatus.BAD_REQUEST);
        }
    }

    private async generateSubscribersPdf(
        houses: ISpdHouse[], managementC: ISpdManagementCompany, subscribers: ISpdSubscriber[],
        detailsInfo: ISpdDetailInfo[],
        SPDs: ISpd[], SPDEntities: SinglePaymentDocumentEntity[],
        meterReadingsData: ISpdMeterReadings[],
        totalId: number
    ) {
        const files = await this.pdfService.generatePdfs(
            houses, managementC, subscribers,
            detailsInfo,
            SPDs, meterReadingsData
        );

        const newSPDEntities: SinglePaymentDocumentEntity[]
            = SPDEntities.map((spd) => {
                const currentPath = files.find(f => f.subscriberId === spd.subscriberId);
                return spd.setTotal(totalId, currentPath.fileName);
            });
        await this.singlePaymentDocumentRepository
            .updateMany(newSPDEntities);
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
                (ReferenceGetSubscribersByHouses.topic, { houseIds });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }
}