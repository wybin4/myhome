import { SubscriberStatus } from "@myhome/interfaces";

export class AddSubscriberDto {
    ownerId: number;
    apartmentId: number;
    personalAccount: string;
    status: SubscriberStatus;
}

export class UpdateSubscriberDto {
    id: number;
}

export class GetSubscribersByUserDto { }
