import { Controller, Body, Post } from "@nestjs/common";
import { RMQValidate, RMQRoute, RMQError } from "nestjs-rmq";
import { VotingService } from "./voting.service";
import { AddVoting, GetVoting, GetVotingsByMCId, UpdateVoting } from '@myhome/contracts';
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";

@Controller('voting')
export class VotingController {
    constructor(
        private readonly votingService: VotingService,
    ) { }

    @Post('add-voting')
    @RMQValidate()
    @RMQRoute(AddVoting.topic)
    async addVoting(@Body() dto: AddVoting.Request) {
        try {
            return this.votingService.addVoting(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @Post('get-voting')
    @RMQValidate()
    @RMQRoute(GetVoting.topic)
    async getVoting(@Body() { id }: GetVoting.Request) {
        try {
            return this.votingService.getVoting(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @Post('update-voting')
    @RMQValidate()
    @RMQRoute(UpdateVoting.topic)
    async updateVoting(@Body() { optionId }: UpdateVoting.Request) {
        try {
            return this.votingService.updateVoting(optionId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @Post('get-votings-by-mcid')
    @RMQValidate()
    @RMQRoute(GetVotingsByMCId.topic)
    async getVotingsByMCId(@Body() { managementCompanyId }: GetVotingsByMCId.Request) {
        try {
            return this.votingService.getVotingsByMCId(managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }
}
