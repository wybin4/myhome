import { Reading } from "../reference/meter.interface";

export interface IDocumentDetail {
    id?: number;
    typeOfServiceId: number;
    tariff: number;
    amountConsumed: number;
    singlePaymentDocumentId: number;
}

export interface IGetDocumentDetail {
    tariff: number,
    amountConsumed: number,
    typeOfServiceId: number,
}

export interface IFullDocumentDetail {
    tariff: number,
    publicUtility: number,
    commonHouseNeed: number,
    typeOfServiceId: number,
}

export interface IGetMeterData {
    fullMeterReadings: Reading,
    typeOfServiceId: number
}

export interface IFullMeterData {
    publicUtility: Reading,
    commonHouseNeed: Reading,
    typeOfServiceId: number,
}

export interface IGetCommonHouseNeed {
    subscriberId: number;
    commonHouseNeeds: IGetDocumentDetail[],
    meterData: IGetMeterData[]
}

export interface IGetPublicUtility {
    subscriberId: number,
    publicUtility: IGetDocumentDetail[],
    meterData: IGetMeterData[]
}