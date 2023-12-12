import { IAppealEntity } from "./appeal.interface";
import { IHouseNotification } from "./notification.interface";
import { IOption, IVote, IVoting } from "./voting.interface";

export interface IGetEvents {
    notifications: { notifications?: IGetHouseNotification[]; totalCount?: number };
    votings: { votings?: IGetVoting[]; totalCount?: number };
    appeals: { appeals?: IGetAppeal[]; totalCount?: number };
}

export interface IGetHouseNotification extends IHouseNotification {
    name: string;
}

export interface IGetAppeal extends IAppealEntity {
    name: string;
    address?: string;
    personalAccount?: string;
    attachment?: string;
}

export interface IGetVoting extends IVoting {
    result?: string;
    options?: IGetOption[];
    name: string;
}

export interface IGetRepoVoting extends IVoting {
    options?: IGetOption[];
}

export interface IGetOption extends IOption {
    numberOfVotes: number;
    votes: IVote[];
}

export enum EventType {
    Appeal = "Appeal",
    Notification = "Notification",
    Voting = "Voting"
}