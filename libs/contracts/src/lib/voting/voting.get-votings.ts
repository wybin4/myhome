import { IVotingWithOptions, RequireSubscriberOrManagementCompany } from "@myhome/interfaces";

export namespace GetVotings {
    export const topic = 'voting.get-votings.query';

    export class Request {
        @RequireSubscriberOrManagementCompany()
        subscriberId?: number;

        @RequireSubscriberOrManagementCompany()
        managementCompanyId?: number;
    }

    export class Response {
        votings!: IVotingWithOptions[];
    }
}
