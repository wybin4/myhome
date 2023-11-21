import { IGetMeterReading } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace ReferenceGetMeterReadingsByHID {
    export const topic = 'reference.get-meter-reading-by-hid.query';

    export class Request {
        @IsNumber({}, { message: "Id дома должно быть числом" })
        houseId!: number;

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        meterReadings!: IGetMeterReading[];
    }
}