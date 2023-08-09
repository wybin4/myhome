import { ITypeOfService } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace ReferenceGetTypesOfService {
    export const topic = 'reference.get-types-of-service.query';

    export class Request {
        @IsArray()
        typeOfServiceIds!: number[];
    }

    export class Response {
        typesOfService!: ITypeOfService[];
    }
}