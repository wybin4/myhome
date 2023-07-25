import { IsNumber, IsString } from 'class-validator';
import { TariffAndNormType, TariffOrNormType } from '@myhome/interfaces';

export namespace ReferenceGetTariffOrNorm {
    export const topic = 'reference.get-tariff-and-norm.query';

    export class Request {
        @IsNumber()
        id!: number;

        @IsString()
        type!: TariffAndNormType;
    }

    export class Response {
        tariffOrNorm!: TariffOrNormType;
    }
}
