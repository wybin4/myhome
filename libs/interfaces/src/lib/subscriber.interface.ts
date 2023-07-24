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