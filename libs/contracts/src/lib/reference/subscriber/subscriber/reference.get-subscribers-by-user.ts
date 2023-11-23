import { IsNumber, Validate } from 'class-validator';
import { ISubscriber, UserRole, } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../../enum.validator';

export namespace ReferenceGetSubscribersByUser {
    export const topic = 'reference.get-subscribers-by-user.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        subscribers!: ISubscriber[] | IGetSubscribersByMCId[];
    }
}

export interface IGetSubscribersByMCId extends ISubscriber {
    ownerName: string;

    houseId: number;
    houseName: string;
    apartmentName: string;
}