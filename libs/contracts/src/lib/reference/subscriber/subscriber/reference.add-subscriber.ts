import { ISubscriber, SubscriberStatus } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../../enum.validator';

export namespace ReferenceAddSubscriber {
    export const topic = 'reference.add-subscriber.command';

    export class Request {
        @IsNumber({}, { message: "Id владельца должен быть числом" })
        ownerId!: number;

        @IsNumber({}, { message: "Id квартиры должно быть числом" })
        apartmentId!: number;

        @IsString({ message: "Лицевой счёт должен быть строкой" })
        personalAccount!: string;

        @Validate(IsValidEnumValue, [SubscriberStatus])
        status!: SubscriberStatus;
    }

    export class Response {
        subscriber!: ISubscriber;
    }
}
