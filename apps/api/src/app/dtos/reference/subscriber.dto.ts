import { SubscriberStatus } from "@myhome/interfaces";
import { IsNumber, IsString } from "class-validator";

export class AddSubscriberDto {
    @IsNumber()
    id?: number;

    @IsNumber()
    ownerId: number;

    @IsNumber()
    apartmentId: number;

    @IsString()
    personalAccount: string;

    @IsString()
    status: SubscriberStatus;
}

export class GetSubscriberDto {
    @IsNumber()
    id: number;
}

export class UpdateSubscriberDto {
    @IsNumber()
    id: number;
}

export class GetSubscribersByMCIdDto {
    @IsNumber()
    @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
    managementCompanyId!: number;
}
