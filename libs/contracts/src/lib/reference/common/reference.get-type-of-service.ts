import { ITypeOfService } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace ReferenceGetTypeOfService {
    export const topic = 'reference.get-type-of-service.query';

    export class Request {
        @IsNumber({}, { message: "Id вида услуг должен быть числом" })
        id!: number;
    }

    export class Response {
        typeOfService!: ITypeOfService;
    }
}