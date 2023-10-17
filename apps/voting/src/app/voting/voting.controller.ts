import {  RMQError, RMQRoute, RMQValidate } from "nestjs-rmq";
import { VotingService } from "./voting.service";
import { AddVoting, GetVoting, GetVotingsByMCId, UpdateVoting } from '@myhome/contracts';
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { Body, Controller } from "@nestjs/common";

@Controller('voting')
export class VotingController {
    constructor(
        private readonly votingService: VotingService,
    ) { }

    @RMQValidate()
    @RMQRoute(AddVoting.topic)
    async addVoting(@Body() dto: AddVoting.Request) {
        try {
            return this.votingService.addVoting(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(GetVoting.topic)
    async getVoting(@Body() { id }: GetVoting.Request) {
        try {
            return this.votingService.getVoting(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(UpdateVoting.topic)
    async updateVoting(@Body() { optionId }: UpdateVoting.Request) {
        try {
            return this.votingService.updateVoting(optionId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

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
