import { IGetMeterReading } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace ReferenceGetMeterReadingByHID {
    export const topic = 'reference.get-meter-reading-by-hid.query';

    export class Request {
        @IsNumber()
        houseId!: number;

        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        meterReadings!: IGetMeterReading[];
    }
}