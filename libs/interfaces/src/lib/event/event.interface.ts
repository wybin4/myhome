import { IAppeal } from "./appeal.interface";
import { IHouseNotification } from "./notification.interface";
import { IVoting } from "./voting.interface";

export interface IGetEvents {
    notifications?: IGetHouseNotification[];
    votings?: IGetVoting[];
    appeals?: IGetAppeal[];
}

export interface IGetHouseNotification extends IHouseNotification {
    houseName: string;
}

export interface IGetAppeal extends IAppeal {
    name: string;
    address?: string;
    personalAccount?: string;
}

export interface IGetVoting extends IVoting {
    result?: string;
    houseName: string;
}

export enum EventType {
    Appeal = "Appeal",
    Notification = "Notification",
    Voting = "Voting"
}