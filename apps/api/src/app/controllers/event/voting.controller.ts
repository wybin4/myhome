import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EventAddVoting, EventUpdateVoting } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddVotingDto, UpdateVotingDto } from '../../dtos/event/voting.dto';

@Controller('voting')
export class VotingController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('update-voting')
    async updateVoting(@Body() dto: UpdateVotingDto) {
        try {
            return await this.rmqService.send<
                EventUpdateVoting.Request,
                EventUpdateVoting.Response
            >(EventUpdateVoting.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-voting')
    async addVoting(@Body() dto: AddVotingDto) {
        try {
            return await this.rmqService.send<
                EventAddVoting.Request,
                EventAddVoting.Response
            >(EventAddVoting.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
