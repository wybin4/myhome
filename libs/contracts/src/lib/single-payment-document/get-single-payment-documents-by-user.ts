import { UserRole } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from "../enum.validator";

export namespace GetSinglePaymentDocumentsByUser {
    export const topic = 'single-payment-document.get-single-payment-documents-by-user.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
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
    apartmentName: string;
    fileSize: number;
    pdfBuffer: string;
    createdAt: Date;
}