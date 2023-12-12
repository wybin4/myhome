import { TariffAndNormType, TypeOfNorm } from "@myhome/interfaces";
import { GetMetaDto } from "../meta.dto";

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

export class GetTariffsAndNormsByUserDto extends GetMetaDto {
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