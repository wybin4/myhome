import { TariffAndNormType, TariffOrNorm } from '@myhome/interfaces';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export namespace ReferenceAddTariffOrNorm {
    export const topic = 'reference.add-tariff-or-norm.command';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;

        @IsNumber()
        typeOfServiceId!: number;

        @IsOptional()
        @IsNumber()
        unitId?: number;

        @IsOptional()
        @IsNumber()
        norm?: number;

        @IsOptional()
        @IsNumber()
        amount?: number;

        @IsOptional()
        @IsString()
        monthName?: string;

        @IsOptional()
        @IsNumber()
        coefficient?: number;

        @IsOptional()
        @IsNumber()
        multiplier?: number;

        @IsString()
        type!: TariffAndNormType;
    }

    export class Response {
        tariffOrNorm!: TariffOrNorm;
    }
}

