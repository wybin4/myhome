import { IVoting } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetVotingsByMCId {
    export const topic = 'voting.get-votings-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        votings!: IGetVotingsByMCId[];
    }
}

interface IGetVotingsByMCId extends IVoting {
    result?: string;
}