import { IsDate, IsOptional } from "class-validator";

export namespace CorrectionGetKeyRate {
    export const topic = 'correction.get-key-rate.query';

    export class Request {
        @IsOptional()
        @IsDate()
        startDate?: Date;

        @IsDate()
        @IsOptional()
        endDate?: Date;
    }

    export class Response {
        keyRate!: number;
    }
}