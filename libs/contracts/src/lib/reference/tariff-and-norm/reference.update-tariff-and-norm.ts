import { TariffAndNormType, TariffOrNormType } from '@myhome/interfaces';
import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceUpdateTariffOrNorm {
    export const topic = 'reference.update-tariff-and-norm.command';

    export class Request {
        @IsNumber()
        id!: number;

        @IsOptional()
        @IsNumber()
        norm?: number;

        @IsOptional()
        @IsNumber()
        supernorm?: number;

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

        @Validate(IsValidEnumValue, [TariffAndNormType])
        type!: TariffAndNormType;
    }

    export class Response {
        tariffOrNorm!: TariffOrNormType;
    }
}
