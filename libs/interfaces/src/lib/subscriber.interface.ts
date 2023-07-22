import { ValueTransformer } from "typeorm";

export interface ISubscriber {
    id: number;
    ownerId: number;
    apartmentId: number;
    personalAccount: string;
    status: SubscriberStatus;
}

export enum SubscriberStatus {
    Archieved = 'Archieved',
    Active = 'Active'
}

export const SubscriberStatusEnumTransformer: ValueTransformer = {
    from: (value: string) => SubscriberStatus[value as keyof typeof SubscriberStatus],
    to: (value: SubscriberStatus) => value,
};