import { ITypeOfService, IUnit } from "@myhome/interfaces";

export namespace ReferenceGetCommon {
    export const topic = 'reference.get-common.query';

    export class Request { }

    export class Response {
        typesOfService!: ITypeOfService[];
        units!: IUnit[];
    }
}