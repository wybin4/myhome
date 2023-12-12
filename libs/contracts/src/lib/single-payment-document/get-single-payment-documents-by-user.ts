import { UserRole } from "@myhome/interfaces";
import { IsBoolean, IsNumber, IsOptional, Validate } from "class-validator";
import { IsValidEnumValue } from "../enum.validator";
import { MetaRequest, MetaResponse } from "../meta.validator";

export namespace GetSinglePaymentDocumentsByUser {
    export const topic = 'single-payment-document.get-single-payment-documents-by-user.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsOptional()
        @IsBoolean({ message: "Флаг должен быть правдой или ложью" })
        withoutAttachments?: boolean;
    }

    export class Response extends MetaResponse{
        singlePaymentDocuments!: IGetSinglePaymentDocumentsByMCId[] | IGetSinglePaymentDocumentsBySId[];
    }
}

export interface IGetSinglePaymentDocumentsByMCId {
    id: number;
    houseId: number;
    city: string;
    street: string;
    houseName: string;
    fileSize: number;
    pdfBuffer: string;
    createdAt: Date;
}

export interface IGetSinglePaymentDocumentsBySId {
    id: number;
    apartmentName?: string;
    mcName?: string;
    mcCheckingAccount?: string;
    fileSize?: number;
    pdfBuffer?: string;
    createdAt: Date;
}