import { IsNumber, Validate } from 'class-validator';
import { ISubscriber, UserRole, } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../../enum.validator';
import { MetaRequest, MetaResponse } from '../../../meta.validator';

export namespace ReferenceGetSubscribersByUser {
    export const topic = 'reference.get-subscribers-by-user.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response extends MetaResponse {
        subscribers!: ISubscriber[] | IGetSubscribersByMCId[];
    }
}

export interface IGetSubscribersByMCId extends ISubscriber {
    ownerName: string;

    houseId: number;
    houseName: string;
    apartmentName: string;
}