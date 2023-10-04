import { IsNumber } from 'class-validator';

export namespace ReferenceGetManagementCompany {
    export const topic = 'reference.get-management-company.command';

    export class Request {
        @IsNumber()
        subscriberId!: number;
    }

    export class Response {
        managementCompanyId!: number;
    }
}
