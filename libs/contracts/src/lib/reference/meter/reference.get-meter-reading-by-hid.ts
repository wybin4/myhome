import { IGetMeterReading } from "@myhome/interfaces";

export namespace ReferenceGetMeterReadingByHID {
    export const topic = 'reference.get-meter-reading-by-hid.query';

    export class Request {
        houseId!: number;
    }

    export class Response {
        meterReadings!: IGetMeterReading[];
    }
}