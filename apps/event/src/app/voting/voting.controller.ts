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
            return await this.votingService.addVoting(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(EventUpdateVoting.topic)
    async updateVoting(@Body() dto: EventUpdateVoting.Request) {
        try {
            return await this.votingService.updateVoting(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
