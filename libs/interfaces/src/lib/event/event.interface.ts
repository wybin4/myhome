import { IAppealEntity } from "./appeal.interface";
import { IHouseNotification } from "./notification.interface";
import { IOption, IVote, IVoting } from "./voting.interface";

export interface IGetEvents {
    notificationsAndVotings: { notificationsAndVotings?: IGetNotificationAndVoting[]; totalCount?: number };
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

export interface IGetNotificationAndVoting {
    voting?: IGetVoting;
    notification?: IGetHouseNotification;
    createdAt: Date;
    eventType: EventTypeResponse;
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

export enum EventTypeRequest {
    Appeal = "Appeal",
    NotificationAndVoting = "NotificationAndVoting"
}

export enum EventTypeResponse {
    Notification = "Notification",
    Voting = "Voting"
}