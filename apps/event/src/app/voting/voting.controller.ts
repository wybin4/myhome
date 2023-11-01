import { RMQError, RMQRoute, RMQValidate } from "nestjs-rmq";
import { VotingService } from "./voting.service";
import { EventAddVoting, EventUpdateVoting } from '@myhome/contracts';
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { Body, Controller } from "@nestjs/common";

@Controller('voting')
export class VotingController {
    constructor(
        private readonly votingService: VotingService,
    ) { }

    @RMQValidate()
    @RMQRoute(EventAddVoting.topic)
    async addVoting(@Body() dto: EventAddVoting.Request) {
        try {
            return this.votingService.addVoting(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventUpdateVoting.topic)
    async updateVoting(@Body() { optionId }: EventUpdateVoting.Request) {
        try {
            return this.votingService.updateVoting(optionId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }
}
