import { RequireHomeOrManagementCompany } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export class GetSinglePaymentDocumentDto {
    @IsArray()
    subscriberIds!: number[];

    @RequireHomeOrManagementCompany()
    managementCompanyId?: number;

    @RequireHomeOrManagementCompany()
    houseId?: number;
}
