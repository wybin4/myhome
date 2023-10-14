import { GetSinglePaymentDocumentSagaState } from "./get-single-payment-document.state";
import { SinglePaymentDocumentEntity } from "../entities/single-payment-document.entity";
import { CANT_ADD_DOCUMENT_DETAILS, RMQException } from "@myhome/constants";
import { HttpStatus } from "@nestjs/common";
import { CalculationState, IDocumentDetail, IFullDocumentDetail, IFullMeterData, IGetCorrection, IGetDocumentDetail, IGetMeterData, ITypeOfService, IUnit, Reading } from "@myhome/interfaces";
import { AddDocumentDetails, GetCommonHouseNeeds, GetCorrection, GetPublicUtilities } from "@myhome/contracts";
import { ISpdDetailInfo, ISpdDocumentDetail } from "../interfaces/single-payment-document.interface";
import { ISpdMeterReading, ISpdMeterReadings } from "../interfaces/reading-table.interface";

export class GetSinglePaymentDocumentSagaStateStarted extends GetSinglePaymentDocumentSagaState {
    private async addDocumentDetails(details: IDocumentDetail[]) {
        try {
            return await this.saga.rmqService.send
                <
                    AddDocumentDetails.Request,
                    AddDocumentDetails.Response
                >
                (AddDocumentDetails.topic, { details: details });
        } catch (e) {
            throw new RMQException(CANT_ADD_DOCUMENT_DETAILS.message, CANT_ADD_DOCUMENT_DETAILS.status);
        }
    }

    private async getPublicUtility(subscriberIds: number[], managementCompanyId: number) {
        return await this.saga.rmqService.send
            <
                GetPublicUtilities.Request,
                GetPublicUtilities.Response
            >(GetPublicUtilities.topic, {
                subscriberIds: subscriberIds,
                managementCompanyId: managementCompanyId
            });
    }

    private async getCommonHouseNeed(subscriberIds: number[], houseId: number) {
        return await this.saga.rmqService.send
            <
                GetCommonHouseNeeds.Request,
                GetCommonHouseNeeds.Response
            >(GetCommonHouseNeeds.topic, {
                subscriberIds: subscriberIds,
                houseId: houseId
            });
    }

    private mergeDocumentDetail(
        pu: IGetDocumentDetail[],
        chn: IGetDocumentDetail[]
    ): IFullDocumentDetail[] {
        const arr: IFullDocumentDetail[] = [];

        for (const puItem of pu) {
            const chnItem = chn.find(obj => obj.typeOfServiceId === puItem.typeOfServiceId);
            if (!chnItem) {
                arr.push({
                    ...puItem,
                    commonHouseNeed: 0,
                    publicUtility: puItem.amountConsumed
                });
            } else {
                arr.push({
                    ...puItem,
                    commonHouseNeed: chnItem.amountConsumed,
                    publicUtility: puItem.amountConsumed
                });
            }
        }

        for (const chnItem of chn) {
            const puItem = pu.find(obj => obj.typeOfServiceId === chnItem.typeOfServiceId);
            if (!puItem) {
                arr.push({
                    ...chnItem,
                    commonHouseNeed: chnItem.amountConsumed,
                    publicUtility: 0
                });
            }
        }

        return arr;
    }

    private mergeMeterReading(
        pu: IGetMeterData[],
        chn: IGetMeterData[]
    ): IFullMeterData[] {
        const arr: IFullMeterData[] = [];

        for (const puItem of pu) {
            const chnItem = chn.find(obj => obj.typeOfServiceId === puItem.typeOfServiceId);
            if (!chnItem) {
                arr.push({
                    ...puItem,
                    commonHouseNeed: { current: 0, previous: 0, difference: 0 },
                    publicUtility: puItem.fullMeterReadings
                });
            } else {
                arr.push({
                    ...puItem,
                    commonHouseNeed: chnItem.fullMeterReadings,
                    publicUtility: puItem.fullMeterReadings
                });
            }
        }

        for (const chnItem of chn) {
            const puItem = pu.find(obj => obj.typeOfServiceId === chnItem.typeOfServiceId);
            if (!puItem) {
                arr.push({
                    ...chnItem,
                    commonHouseNeed: chnItem.fullMeterReadings,
                    publicUtility: { current: 0, previous: 0, difference: 0 }
                });
            }
        }

        return arr;
    }

    public async calculateDetails(
        subscriberIds: number[],
        typesOfService: ITypeOfService[], units: IUnit[],
        managementCompanyId?: number, houseId?: number
    ): Promise<{
        detailIds: number[], detailsInfo: ISpdDetailInfo[],
        meterReadingsData: ISpdMeterReadings[],
        singlePaymentDocuments: SinglePaymentDocumentEntity[],
    }> {
        const { publicUtilities } = await this.getPublicUtility(subscriberIds, managementCompanyId);
        const { commonHouseNeeds } = await this.getCommonHouseNeed(subscriberIds, houseId);

        const details: IDocumentDetail[] = [];
        const detailsInfo: ISpdDetailInfo[] = [];
        const meterReadingsData: ISpdMeterReadings[] = [];

        for (const pu of publicUtilities) {
            const chn = commonHouseNeeds.find(obj => obj.subscriberId === pu.subscriberId);
            // По id юзера ищем нужные ЕПД
            const spd = this.saga.singlePaymentDocuments.find(obj => obj.subscriberId === pu.subscriberId);

            // Пушим для добавления в базу, обогащая каждый объект spdId
            details.push(...chn.commonHouseNeeds.map(obj => {
                return {
                    singlePaymentDocumentId: spd.id,
                    ...obj
                }
            }));
            details.push(...pu.publicUtility.map(obj => {
                return {
                    singlePaymentDocumentId: spd.id,
                    ...obj
                }
            }));

            // Мёрджим publicUtility и commonHouseNeeds для одного конкретного абонента по typeOfServiceId
            const mergedDDParts = this.mergeDocumentDetail(pu.publicUtility, chn.commonHouseNeeds);
            // Для PDF нужно сформировать полную картину
            let tempSum = 0;
            const detailInfo: ISpdDocumentDetail[] = [];
            for (const item of mergedDDParts) {
                const currentTypeOfService = typesOfService.find(obj => obj.id === item.typeOfServiceId);
                const currentUnit = units.find(obj => obj.id === currentTypeOfService.unitId);

                const temp = (item.commonHouseNeed + item.publicUtility) * item.tariff
                tempSum += temp;

                detailInfo.push({
                    typeOfServiceName: currentTypeOfService.name,
                    unitName: currentUnit.name,
                    volume: {
                        commonHouseNeed: item.commonHouseNeed, publicUtility: item.publicUtility
                    },
                    tariff: item.tariff,
                    amount: {
                        commonHouseNeed: item.commonHouseNeed * item.tariff,
                        publicUtility: item.publicUtility * item.tariff
                    },
                    totalAmount: temp
                });
            }
            detailsInfo.push({
                total: tempSum,
                details: detailInfo,
                subscriberId: pu.subscriberId
            });

            // Мёрджим publicUtility и commonHouseNeeds для одного конкретного абонента по typeOfServiceId
            const mergedMDParts = this.mergeMeterReading(pu.meterData, chn.meterData);
            const meterReadingData: ISpdMeterReading[] = [];
            // Для PDF, но уже с meterData
            for (const meterReading of mergedMDParts) {
                const currentTypeOfService = typesOfService.find(obj => obj.id === meterReading.typeOfServiceId);
                const currentUnit = units.find(obj => obj.id === currentTypeOfService.unitId);

                const getDiff = (fullMeterReadings: Reading) => {
                    return 'difference' in fullMeterReadings ? {
                        reading: `${fullMeterReadings.current}/${fullMeterReadings.previous}`,
                        difference: fullMeterReadings.difference
                    } : { reading: '', difference: 0 }
                };
                const getNorm = (publicUt: Reading, common: Reading) => {
                    const norm = { individual: 0, common: 0 };
                    if ('norm' in publicUt) {
                        norm.individual = publicUt.norm;
                    }
                    if ('norm' in common) {
                        norm.common = common.norm;
                    }
                    return norm;
                };
                const getTotalVolume = (publicUt: Reading, common: Reading) => {
                    let volume = 0;
                    if ('difference' in publicUt) {
                        volume += publicUt.difference;
                    }
                    if ('difference' in common) {
                        volume += common.difference;
                    }
                    return volume;
                };

                const individualReadings = getDiff(meterReading.publicUtility);
                const commonReadings = getDiff(meterReading.commonHouseNeed);
                const norm = getNorm(meterReading.publicUtility, meterReading.commonHouseNeed);
                const volume = getTotalVolume(meterReading.publicUtility, meterReading.commonHouseNeed);

                meterReadingData.push({
                    individualReadings: individualReadings,
                    typeOfServiceName: currentTypeOfService.name, unitName: currentUnit.name,
                    norm: norm,
                    commonReadings: commonReadings,
                    totalVolume: volume,
                });
            }
            meterReadingsData.push({
                readings: meterReadingData,
                subscriberId: pu.subscriberId,
            });
        }

        this.saga.singlePaymentDocuments.map(spd => {
            const currSum = detailsInfo.find(s => spd.subscriberId === s.subscriberId);
            spd.setAmount(currSum.total);
        });
        this.saga.setState(CalculationState.DetailsCalculated);

        // Добавляем details в базу и на выход получаем detailIds
        let detailIds: number[];
        try {
            detailIds = (await this.addDocumentDetails(details)).detailIds;
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }

        return { detailIds, detailsInfo, meterReadingsData, singlePaymentDocuments: this.saga.singlePaymentDocuments }
    }

    public async calculateCorrection(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Невозможно рассчитать задолженность и пени без деталей ЕПД", HttpStatus.BAD_REQUEST);
    }

    public async cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        this.saga.setState(CalculationState.Cancelled);
        return { singlePaymentDocuments: this.saga.singlePaymentDocuments };
    }
}

export class GetSinglePaymentDocumentSagaStateDetailsCalculated extends GetSinglePaymentDocumentSagaState {
    private async getCorrection(subscriberSPDs: IGetCorrection[], keyRate?: number) {
        try {
            return await this.saga.rmqService.send
                <
                    GetCorrection.Request,
                    GetCorrection.Response
                >
                (GetCorrection.topic, { subscriberSPDs: subscriberSPDs, keyRate: keyRate });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }
    public async calculateDetails(): Promise<{ detailIds: number[]; detailsInfo: ISpdDetailInfo[]; meterReadingsData: ISpdMeterReadings[]; singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("ЕПД уже в процессе расчёта", HttpStatus.BAD_REQUEST);
    }
    public async calculateCorrection(subscriberSPDs: IGetCorrection[], keyRate?: number): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        const { debts, penalties, deposits } = await this.getCorrection(subscriberSPDs, keyRate);
        this.saga.singlePaymentDocuments.map(spd => {
            const currDebt = debts.find(d => spd.subscriberId === d.subscriberId);
            const currPenalty = penalties.find(p => spd.subscriberId === p.subscriberId);
            const currDeposit = deposits.find(d => spd.subscriberId === d.subscriberId);
            spd.setCorrection(currDebt.debt, currPenalty.penalty, currDeposit.deposit);
        });
        this.saga.setState(CalculationState.CorrectionsCalculated);
        return { singlePaymentDocuments: this.saga.singlePaymentDocuments };
    }
    public cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя отменить расчёт в процессе", HttpStatus.BAD_REQUEST);
    }
}

export class GetSinglePaymentDocumentSagaStateCorrectionsCalculated extends GetSinglePaymentDocumentSagaState {
    public async calculateDetails(): Promise<{ detailIds: number[]; detailsInfo: ISpdDetailInfo[]; meterReadingsData: ISpdMeterReadings[]; singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя сделать перерасчёт уже рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
    public calculateCorrection(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя сделать перерасчёт уже рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
    public cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя отменить расчёт рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
}
export class GetSinglePaymentDocumentSagaStateCancelled extends GetSinglePaymentDocumentSagaState {
    public async calculateDetails(subscriberIds: number[], typesOfService: ITypeOfService[], units: IUnit[], managementCompanyId?: number, houseId?: number,): Promise<{ detailIds: number[]; detailsInfo: ISpdDetailInfo[]; meterReadingsData: ISpdMeterReadings[]; singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        this.saga.setState(CalculationState.Started);
        return this.saga.getState().calculateDetails(subscriberIds, typesOfService, units, managementCompanyId, houseId);
    }
    public calculateCorrection(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя рассчитать отменённый ЕПД", HttpStatus.BAD_REQUEST);
    }
    public cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя отменить отменённый ЕПД", HttpStatus.BAD_REQUEST);
    }
}
