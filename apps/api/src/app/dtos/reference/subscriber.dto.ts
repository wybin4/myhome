import { IAddSubscriber, IMeta } from "@myhome/interfaces";

export class AddSubscribersDto {
    subscribers: IAddSubscriber[];
}

export class UpdateSubscriberDto {
    id: number;
}

export class GetSubscribersByUserDto {
    meta?: IMeta;
}
