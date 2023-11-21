import { ISubscriber } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace ReferenceAddSubscriber {
    export const topic = 'reference.add-subscriber.command';

    export class Request {
        @IsNumber({}, { message: "Id владельца должен быть числом" })
        ownerId!: number;

        @IsNumber({}, { message: "Id квартиры должно быть числом" })
        apartmentId!: number;

        @IsString({ message: "Лицевой счёт должен быть строкой" })
        personalAccount!: string;
    }

    export class Response {
        subscriber!: IGetSubscriber;
    }
}

export interface IGetSubscriber extends ISubscriber {
    apartmentName: string;
    ownerName: string;
}