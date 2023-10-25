import { IsNumber, Validate } from 'class-validator';
import { TariffAndNormType, TariffOrNormType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceGetTariffOrNorm {
    export const topic = 'reference.get-tariff-and-norm.query';

    export class Request {
        @IsNumber({}, { message: "Id тарифа или норматива должен быть числом" })
        id!: number;

        @Validate(IsValidEnumValue, [TariffAndNormType])
        type!: TariffAndNormType;
    }

    export class Response {
        tariffOrNorm!: TariffOrNormType;
    }
}
