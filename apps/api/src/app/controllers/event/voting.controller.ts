import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { EventAddVoting, EventUpdateVoting } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddVotingDto, UpdateVotingDto } from '../../dtos/event/voting.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload, UserRole } from '@myhome/interfaces';
import { RoleGuard } from '../../guards/role.guard';

@Controller('voting')
export class VotingController {
    constructor(private readonly rmqService: RMQService) { }

    @SetMetadata('role', UserRole.Owner)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(200)
    @Post('update-voting')
    async updateVoting(@Req() req: { user: IJWTPayload }, @Body() dto: UpdateVotingDto) {
        try {
            return await this.rmqService.send<
                EventUpdateVoting.Request,
                EventUpdateVoting.Response
            >(EventUpdateVoting.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
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
