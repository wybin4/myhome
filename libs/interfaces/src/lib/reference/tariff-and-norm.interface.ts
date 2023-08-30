/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationOptions, registerDecorator, ValidationArguments } from "class-validator";

export interface IBaseTariffAndNorm {
  id?: number;
  managementCompanyId: number;
  typeOfServiceId: number;
}

export enum TypeOfNorm { Individual = 'Individual', General = 'General' };

export interface INorm extends IBaseTariffAndNorm {
  unitId: number;
  norm: number;
  typeOfNorm: TypeOfNorm;
}

export interface IMunicipalTariff extends IBaseTariffAndNorm {
  unitId: number;
  norm: number;
  supernorm?: number;
  multiplyingFactor?: number;
}

export interface ISocialNorm extends IBaseTariffAndNorm {
  unitId: number;
  norm: number;
  amount: number;
}

export interface ISeasonalityFactor extends IBaseTariffAndNorm {
  monthName: string;
  coefficient: number;
}

export interface ICommonHouseNeedTariff {
  id?: number;
  typeOfServiceId: number;
  unitId: number;
  multiplier: number;
}

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
