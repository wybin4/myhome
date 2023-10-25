import { TariffAndNormType, TariffOrNormType } from '@myhome/interfaces';
import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceUpdateTariffOrNorm {
    export const topic = 'reference.update-tariff-and-norm.command';

    export class Request {
        @IsNumber({}, { message: "Id тарифа или норматива должен быть числом" })
        id!: number;

        @IsOptional()
        @IsNumber({}, { message: "Норматив должен быть числом" })
        norm?: number;

        @IsOptional()
        @IsNumber({}, { message: "Тариф сверх нормы должен быть числом" })
        supernorm?: number;

        @IsOptional()
        @IsNumber({}, { message: "Количество должно быть числом" })
        amount?: number;

        @IsOptional()
        @IsString({ message: "Название месяца должно быть строкой" })
        monthName?: string;

        @IsOptional()
        @IsNumber({}, { message: "Коэффициент должен быть числом" })
        coefficient?: number;

        @IsOptional()
        @IsNumber({}, { message: "Множитель должен быть числом" })
        multiplier?: number;

        @Validate(IsValidEnumValue, [TariffAndNormType])
        type!: TariffAndNormType;
    }

    export class Response {
        tariffOrNorm!: TariffOrNormType;
    }
}
