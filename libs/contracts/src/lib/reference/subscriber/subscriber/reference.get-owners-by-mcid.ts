import { IsNumber } from 'class-validator';

export namespace ReferenceGetOwnersByMCId {
    export const topic = 'reference.get-owners-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        ownerIds!: number[];
    }
}