import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { IGetMeterReadings } from '@myhome/interfaces';

export namespace ReferenceGetIndividualMeterReadings {
    export const topic = 'reference.get-individual-meter-readings.query';

    export class Request {
        @IsOptional()
        @IsArray({ message: "Id абонентов должны быть массивом чисел" })
        subscriberIds?: number[];

        @IsOptional()
        @IsNumber({}, { message: "Id дома должно быть числом" })
        houseId?: number;

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        meterReadings!: IGetMeterReadings[];
    }
}
