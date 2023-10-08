import { IsNumber, IsString } from 'class-validator';
import { ICommonHouseNeedTariff, IMunicipalTariff, INorm, ISeasonalityFactor, ISocialNorm, TariffAndNormType } from '@myhome/interfaces';

export namespace ReferenceGetTariffsOrNormsByMCId {
    export const topic = 'reference.get-tariffs-and-norms-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;

        @IsString()
        type!: TariffAndNormType;
    }

    export class Response {
        tariffAndNorms!: GetTariffsOrNormsByMCIdType[];
    }
}

export interface IGetNormByMCId extends INorm {
    typeOfServiceName: string;
    unitName: string;
}

export interface IGetMunicipalTariffByMCId extends IMunicipalTariff {
    typeOfServiceName: string;
    unitName: string;
}

export interface IGetSocialNormByMCId extends ISocialNorm {
    typeOfServiceName: string;
    unitName: string;
}

export interface IGetSeasonalityFactorByMCId extends ISeasonalityFactor {
    typeOfServiceName: string;
}

export interface IGetCommonHouseNeedTariffByMCId extends ICommonHouseNeedTariff {
    typeOfServiceName: string;
    unitName: string;
    houseName: string;
}

export type GetTariffsOrNormsByMCIdType = IGetNormByMCId
    | IGetMunicipalTariffByMCId | IGetSocialNormByMCId
    | IGetSeasonalityFactorByMCId | IGetCommonHouseNeedTariffByMCId;
