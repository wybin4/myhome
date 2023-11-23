import { ITypeOfService } from "@myhome/interfaces";

export namespace ReferenceGetAllTypesOfService {
    export const topic = 'reference.get-all-types-of-service.query';

    export class Request { }

    export class Response {
        typesOfService!: ITypeOfService[];
    }
}