import { TariffAndNormType, TypeOfNorm } from "@myhome/interfaces";

export class AddTariffAndNormDto {
    typeOfServiceId: number;
    unitId?: number;
    norm?: number;
    amount?: number;
    monthName?: string;
    coefficient?: number;
    multiplier?: number;
    multiplyingFactor?: number;
    type: TariffAndNormType;
    typeOfNorm: TypeOfNorm;
}

export class GetTariffsAndNormsByUserDto {
    type: TariffAndNormType;
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