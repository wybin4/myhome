import { IsArray } from 'class-validator';
import { ISubscriberAllInfo } from '@myhome/interfaces';

export namespace ReferenceGetSubscribersAllInfo {
    export const topic = 'reference.get-subscribers-all-info.query';

    export class Request {
        @IsArray()
        ids!: number[];
    }

    export class Response {
        subscribers!: ISubscriberAllInfo[];
    }
}

