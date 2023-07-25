import { IsNumber, IsString } from 'class-validator';
import { TariffAndNormType, TariffOrNorm } from '@myhome/interfaces';

export namespace ReferenceGetTariffOrNorm {
    export const topic = 'reference.get-tariff-or-norm.query';

    export class Request {
        @IsNumber()
        id!: number;

        @IsString()
        type!: TariffAndNormType;
    }

    export class Response {
        tariffOrNorm!: TariffOrNorm;
    }
}
