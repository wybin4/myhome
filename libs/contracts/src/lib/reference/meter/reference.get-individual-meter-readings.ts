import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { IGetMeterReadings } from '@myhome/interfaces';

export namespace ReferenceGetIndividualMeterReadings {
    export const topic = 'reference.get-individual-meter-readings.query';

    export class Request {
        @IsOptional()
        @IsArray()
        subscriberIds?: number[];

        @IsOptional()
        @IsNumber()
        houseId?: number;

        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        meterReadings!: IGetMeterReadings[];
    }
}
