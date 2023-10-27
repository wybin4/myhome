export interface IVoting {
    id?: number;
    houseId: number;
    title: string;
    createdAt: Date;
    expiredAt: Date;
    status: VotingStatus;
}

export enum VotingStatus {
    Open = 'Open',
    Close = 'Close'
}

export interface IOption {
    id?: number;
    votingId: number;
    text: string;
    numberOfVotes?: number;
}

export interface IVotingWithOptions {
    voting: IVoting; options: IOption[];
}