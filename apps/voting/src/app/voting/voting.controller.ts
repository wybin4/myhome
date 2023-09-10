import { Controller, Body, Post } from "@nestjs/common";
import { RMQValidate, RMQRoute } from "nestjs-rmq";
import { VotingService } from "./voting.service";
import { AddVoting, GetVoting, GetVotings, UpdateVoting } from '@myhome/contracts';

@Controller('voting')
export class VotingController {
    constructor(
        private readonly votingService: VotingService,
    ) { }

    @Post('add-voting')
    @RMQValidate()
    @RMQRoute(AddVoting.topic)
    async createVoting(@Body() dto: AddVoting.Request) {
        return this.votingService.createVoting(dto);
    }

    @Post('get-voting')
    @RMQValidate()
    @RMQRoute(GetVoting.topic)
    async getVoting(@Body() { id }: GetVoting.Request) {
        return this.votingService.getVoting(id);
    }

    @Post('update-voting')
    @RMQValidate()
    @RMQRoute(UpdateVoting.topic)
    async updateVoting(@Body() { optionId }: UpdateVoting.Request) {
        return this.votingService.updateVoting(optionId);
    }

    @Post('get-votings')
    @RMQValidate()
    @RMQRoute(GetVotings.topic)
    async getVotings(@Body() dto: GetVotings.Request) {
        return this.votingService.getVotings(dto);
    }
}
