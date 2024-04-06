import { IsNumber } from "class-validator";
import { IGetChargeChart } from "@myhome/interfaces";

export namespace CorrectionGetChargeChart {
    export const topic = 'correction.get-chart-data.query';

    export class Request {
        @IsNumber({}, { message: "Id владельца должен быть числом" })
        userId!: number;

        @IsNumber({}, { message: "Количество должно быть числом" })
        count!: number;
    }

    export class Response {
        charges!: IGetChargeChart[];
    }
}
