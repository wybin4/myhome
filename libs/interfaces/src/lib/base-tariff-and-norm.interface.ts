export interface IBaseTariffAndNorm {
  id?: number;
  managementCompanyId: number;
  typeOfServiceId: number;
}
export interface INorm extends IBaseTariffAndNorm {
  unitId: number;
  norm: number;
}

export interface IMunicipalTariff extends IBaseTariffAndNorm {
  unitId: number;
  norm: number;
  supernorm: number;
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