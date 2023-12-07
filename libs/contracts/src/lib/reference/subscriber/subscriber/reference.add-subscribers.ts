import { IAddSubscriber, ISubscriber } from '@myhome/interfaces';
import { ArrayMinSize, IsDefined, IsString } from 'class-validator';
import { ValidateNestedArray } from '../../../array.validator';
import { ParseInt } from '../../../parse.validator';
import { Type } from 'class-transformer';

export namespace ReferenceAddSubscribers {
    export const topic = 'reference.add-subscribers.command';

    class SubscriberValidator {
        @ParseInt({ message: "Id владельца должен быть числом" })
        ownerId!: number;

        @ParseInt({ message: "Id квартиры должно быть числом" })
        apartmentId!: number;

        @Type(() => String)
        @IsString({ message: "Лицевой счёт должен быть строкой" })
        personalAccount!: string;
    }

    export class Request {
        @IsDefined({ message: "Массив абонентов должен существовать" })
        @ArrayMinSize(1, { message: "Массив абонентов не должен быть пустым" })
        @ValidateNestedArray(SubscriberValidator)
        subscribers!: IAddSubscriber[];
    }

    export class Response {
        subscribers!: IGetSubscriber[];
    }
}

export interface IGetSubscriber extends ISubscriber {
    apartmentName: string;
    ownerName: string;
}