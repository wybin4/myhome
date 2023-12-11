import { IsNumber } from "class-validator";

export namespace GetMCIdBySPDId {
    export const topic = 'single-payment-document.get-mcid-by-spd.query';

    export class Request {
        @IsNumber({}, { message: "Id ЕПД должен быть числом" })
        id!: number;
    }

    export class Response {
        managementCompanyId!: number;
    }
}
