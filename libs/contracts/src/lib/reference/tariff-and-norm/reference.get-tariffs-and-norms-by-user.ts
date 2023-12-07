import { IsNumber, IsOptional, Validate } from 'class-validator';
import { ICommonHouseNeedTariff, IMeta, IMunicipalTariff, INorm, ISeasonalityFactor, ISocialNorm, TariffAndNormType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';
import { MetaValidator } from '../../meta.validator';
import { ValidateNestedArray } from '../../array.validator';

export namespace ReferenceGetTariffsOrNormsByUser {
    export const topic = 'reference.get-tariffs-and-norms-by-user.query';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @Validate(IsValidEnumValue, [TariffAndNormType])
        type!: TariffAndNormType;

        @IsOptional()
        @ValidateNestedArray(MetaValidator)
        meta?: IMeta;
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
