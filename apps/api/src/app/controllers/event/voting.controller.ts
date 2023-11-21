import { BadRequestException, Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { EventAddVoting, EventUpdateVoting } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddVotingDto, UpdateVotingDto } from '../../dtos/event/voting.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { INCORRECT_USER_ROLE } from '@myhome/constants';
import { UserRole } from '@myhome/interfaces';

@Controller('voting')
export class VotingController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('update-voting')
    async updateVoting(@Req() req, @Body() dto: UpdateVotingDto) {
        try {
            if (req.user.userRole === UserRole.Owner) {
                return await this.rmqService.send<
                    EventUpdateVoting.Request,
                    EventUpdateVoting.Response
                >(EventUpdateVoting.topic, { ...dto, userId: req.user.userId });
            } else {
                throw new BadRequestException(INCORRECT_USER_ROLE);
            }
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(201)
    @Post('add-voting')
    async addVoting(@Req() req, @Body() dto: AddVotingDto) {
        try {
            if (req.user.userRole === UserRole.ManagementCompany) {
                return await this.rmqService.send<
                    EventAddVoting.Request,
                    EventAddVoting.Response
                >(EventAddVoting.topic, dto);
            } else {
                throw new BadRequestException(INCORRECT_USER_ROLE);
            }
        } catch (e) {
            CatchError(e);
        }
    }

}
