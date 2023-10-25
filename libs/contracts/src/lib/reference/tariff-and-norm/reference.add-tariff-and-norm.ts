import { RequireHomeOrManagementCompany, TariffAndNormType, TariffOrNormType, TypeOfNorm } from '@myhome/interfaces';
import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceAddTariffOrNorm {
    export const topic = 'reference.add-tariff-and-norm.command';

    export class Request {
        @RequireHomeOrManagementCompany()
        managementCompanyId?: number;

        @RequireHomeOrManagementCompany()
        houseId?: number;

        @IsNumber({}, { message: "Id вида услуг должен быть числом" })
        typeOfServiceId!: number;

        @IsOptional()
        @IsNumber({}, { message: "Id единиц измерения должен быть числом" })
        unitId?: number;

        @IsOptional()
        @IsNumber({}, { message: "Норматив должен быть числом" })
        norm?: number;

        @IsOptional()
        @IsNumber({}, { message: "Количество должно быть числом" })
        amount?: number;

        @IsOptional()
        @IsNumber({}, { message: "Тариф сверх нормы должен быть числом" })
        supernorm?: number;

        @IsOptional()
        @IsString({ message: "Название месяца должно быть строкой" })
        monthName?: string;

        @IsOptional()
        @IsNumber({}, { message: "Коэффициент должен быть числом" })
        coefficient?: number;

        @IsOptional()
        @IsNumber({}, { message: "Множитель должен быть числом" })
        multiplier?: number;

        @IsOptional()
        @IsNumber({}, { message: "Повышающий коэффициент должен быть числом" })
        multiplyingFactor?: number;

        @Validate(IsValidEnumValue, [TariffAndNormType])
        type!: TariffAndNormType;

        @Validate(IsValidEnumValue, [TypeOfNorm])
        typeOfNorm!: TypeOfNorm;
    }

    export class Response {
        tariffOrNorm!: TariffOrNormType;
    }
}

