export interface ISubscriber {
    id?: number;
    ownerId: number;
    apartmentId: number;
    personalAccount: string;
    status: SubscriberStatus;
}

export interface ISubscriberAllInfo {
    id?: number;
    name: string;
    address: string;
    personalAccount: string;
    apartmentArea: number;
    livingArea: number;
    numberOfRegistered: number;
}

export enum SubscriberStatus {
    Archieved = 'Archieved',
    Active = 'Active'
}