import { IAppeal } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace EventGetAppealsByMCId {
    export const topic = 'event.get-appeals-by-mcid.query';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        appeals!: IGetAppealsByMCId[];
    }
}

interface IGetAppealsByMCId extends IAppeal {
    apartmentName: string;
    personalAccount: string;
    ownerName: string;
}