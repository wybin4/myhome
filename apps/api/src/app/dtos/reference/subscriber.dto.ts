import { IAddSubscriber } from "@myhome/interfaces";

export class AddSubscribersDto {
    subscribers: IAddSubscriber[];
}

export class UpdateSubscriberDto {
    id: number;
}

export class GetSubscribersByUserDto { }
