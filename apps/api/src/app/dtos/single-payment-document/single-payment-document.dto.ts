import { RequireSubscriberIdsOrHouseIds } from "@myhome/interfaces";
import { IsArray, IsNumber, IsOptional } from "class-validator";

export class GetSinglePaymentDocumentDto {
    @RequireSubscriberIdsOrHouseIds()
    @IsArray()
    subscriberIds?: number[];

    @RequireSubscriberIdsOrHouseIds()
    @IsArray()
    houseIds?: number[];

    @IsNumber()
    managementCompanyId!: number;

    @IsOptional()
    @IsNumber()
    keyRate?: number;
}
