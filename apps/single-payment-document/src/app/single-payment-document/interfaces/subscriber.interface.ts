import { ISubscriberAllInfo } from "@myhome/interfaces";

export type ISpdSubscriber = ISubscriberAllInfo;

export interface ISpdManagementCompany {
    name: string; address: string; phone: string; email: string;
}

export interface ISpdHouse {
    id: number; livingArea: number; noLivingArea: number; commonArea: number;
}
