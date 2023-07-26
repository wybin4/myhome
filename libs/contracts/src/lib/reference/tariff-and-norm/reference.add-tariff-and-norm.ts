import { RequireHomeOrManagementCompany, TariffAndNormType, TariffOrNormType } from '@myhome/interfaces';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export namespace ReferenceAddTariffOrNorm {
    export const topic = 'reference.add-tariff-and-norm.command';

    export class Request {
        @RequireHomeOrManagementCompany()
        managementCompanyId?: number;

        @RequireHomeOrManagementCompany()
        houseId?: number;

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
        @IsNumber()
        supernorm?: number;

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
        tariffOrNorm!: TariffOrNormType;
    }
}

