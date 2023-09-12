import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AddVoting, GetVoting, GetVotings, UpdateVoting } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddVotingDto, GetVotingDto, GetVotingsDto, UpdateVotingDto } from '../../dtos/voting/voting.dto';

@Controller('voting')
export class VotingController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-voting')
    async getVoting(@Body() dto: GetVotingDto) {
        try {
            return await this.rmqService.send<
                GetVoting.Request,
                GetVoting.Response
            >(GetVoting.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-votings')
    async getVotings(@Body() dto: GetVotingsDto) {
        try {
            return await this.rmqService.send<
                GetVotings.Request,
                GetVotings.Response
            >(GetVotings.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }


    @HttpCode(200)
    @Post('update-voting')
    async updateVoting(@Body() dto: UpdateVotingDto) {
        try {
            return await this.rmqService.send<
                UpdateVoting.Request,
                UpdateVoting.Response
            >(UpdateVoting.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-voting')
    async addVoting(@Body() dto: AddVotingDto) {
        try {
            return await this.rmqService.send<
                AddVoting.Request,
                AddVoting.Response
            >(AddVoting.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
