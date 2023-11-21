/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationOptions, registerDecorator, ValidationArguments } from "class-validator";

export interface IBaseTariffAndNorm {
  id?: number;
  typeOfServiceId: number;
}

export interface IAddBaseTariffAndNorm {
  id?: number;
  typeOfServiceId: number;
  data: TariffAndNormData;
}

export interface TariffAndNormData { }

export enum TypeOfNorm { Individual = 'Individual', General = 'General' };

export interface NormData extends TariffAndNormData {
  unitId: number;
  norm: number;
  typeOfNorm: TypeOfNorm;
  managementCompanyId: number;
}

export interface MunicipalTariffData extends TariffAndNormData {
  unitId: number;
  norm: number;
  supernorm?: number;
  multiplyingFactor?: number;
  managementCompanyId: number;
}

export interface SocialNormData extends TariffAndNormData {
  unitId: number;
  norm: number;
  amount: number;
  managementCompanyId: number;
}

export interface SeasonalityFactorData extends TariffAndNormData {
  monthName: string;
  coefficient: number;
  managementCompanyId: number;
}

export interface CommonHouseNeedTariffData extends TariffAndNormData {
  unitId: number;
  multiplier: number;
  houseId: number;
}

export interface INorm extends IBaseTariffAndNorm, NormData { }

export interface IMunicipalTariff extends IBaseTariffAndNorm, MunicipalTariffData { }

export interface ISocialNorm extends IBaseTariffAndNorm, SocialNormData { }

export interface ISeasonalityFactor extends IBaseTariffAndNorm, SeasonalityFactorData { }

export interface ICommonHouseNeedTariff extends IBaseTariffAndNorm, CommonHouseNeedTariffData { }

export enum TariffAndNormType {
  Norm = 'Norm',
  MunicipalTariff = 'MunicipalTariff',
  SocialNorm = 'SocialNorm',
  SeasonalityFactor = 'SeasonalityFactor',
  CommonHouseNeedTariff = 'CommonHouseNeedTariff',
}

export type TariffOrNormType = INorm | IMunicipalTariff | ISocialNorm | ISeasonalityFactor | ICommonHouseNeedTariff;

export function RequireHomeOrManagementCompany(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'RequireHomeOrManagementCompany',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const houseId = (args.object as any).houseId;
          const managementCompanyId = (args.object as any).managementCompanyId;
          return !!houseId || !!managementCompanyId;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(args: ValidationArguments) {
          return `В зависимости от типа тарифа или нормы введите houseId или managementCompanyId`;
        },
      },
    });
  };
}
