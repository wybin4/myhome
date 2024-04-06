import { IsNumber } from "class-validator";
import { MetaRequest, MetaResponse } from "../../meta.validator";
import { IGetCharge } from "@myhome/interfaces";

export namespace CorrectionGetCharges {
    export const topic = 'correction.get-charges.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id владельца должен быть числом" })
        userId!: number;
    }

    export class Response extends MetaResponse {
        charges!: IGetCharge[];
    }
}
