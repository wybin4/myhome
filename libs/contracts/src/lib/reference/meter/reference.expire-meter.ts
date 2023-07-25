import { IGeneralMeter, IIndividualMeter } from "@myhome/interfaces";
import { IsArray, IsOptional } from "class-validator";

export namespace ReferenceExpireMeter {
    export const topic = 'reference.expire-meter.query';

    export class Request {
        @IsOptional()
        @IsArray()
        individualMeters?: IIndividualMeter;

        @IsOptional()
        @IsArray()
        generalMeters?: IGeneralMeter;
    }

}
