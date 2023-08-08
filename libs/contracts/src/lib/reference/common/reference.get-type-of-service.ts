import { ITypeOfService } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace ReferenceGetTypeOfService {
    export const topic = 'reference.get-type-of-service.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        typeOfService!: ITypeOfService;
    }
}