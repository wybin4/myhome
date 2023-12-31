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
}

export interface IVote {
    id?: number;
    optionId: number;
    userId: number;
}