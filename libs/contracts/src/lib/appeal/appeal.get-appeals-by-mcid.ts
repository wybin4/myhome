import { IAppeal } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace AppealGetAppealsByMCId {
    export const topic = 'appeal.get-appeals-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        appeals!: IGetAppealsByMCId[];
    }
}

interface IGetAppealsByMCId extends IAppeal{
    typeOfAppealName: string;
    apartmentName: string;
    personalAccount: string;
    ownerName: string;
}