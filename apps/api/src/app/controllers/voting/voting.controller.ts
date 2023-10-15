import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AddVoting, GetVoting, GetVotingsByMCId, UpdateVoting } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddVotingDto, GetVotingDto, GetVotingsByMCIdDto, UpdateVotingDto } from '../../dtos/voting/voting.dto';

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
    @Post('get-votings-by-mcid')
    async getVotingsByMCId(@Body() dto: GetVotingsByMCIdDto) {
        try {
            return await this.rmqService.send<
                GetVotingsByMCId.Request,
                GetVotingsByMCId.Response
            >(GetVotingsByMCId.topic, dto);
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
