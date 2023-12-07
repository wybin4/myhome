export interface ISubscriber {
    id?: number;
    ownerId: number;
    apartmentId: number;
    personalAccount: string;
    status: SubscriberStatus;
}

export type IAddSubscriber = Omit<ISubscriber, "status">;

export enum SubscriberStatus {
    Archieved = 'Archieved',
    Active = 'Active'
}