import { IMeta, TariffAndNormType, TypeOfNorm } from "@myhome/interfaces";

export class AddTariffAndNormsDto {
    tariffAndNorms!: {
        typeOfServiceId: number;
        unitId?: number;
        norm?: number;
        amount?: number;
        monthName?: string;
        coefficient?: number;
        multiplier?: number;
        multiplyingFactor?: number;
        type: TariffAndNormType;
        typeOfNorm?: TypeOfNorm;
        houseId?: number;
    }[];
    type!: TariffAndNormType;
}

export class GetTariffsAndNormsByUserDto {
    type: TariffAndNormType;
    meta?: IMeta;
}

export class UpdateTariffAndNormDto {
    id: number;
    norm?: number;
    amount?: number;
    monthName?: string;
    coefficient?: number;
    multiplier?: number;
    type: TariffAndNormType;
}