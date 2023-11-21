import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { ReferenceAddSubscriber, ReferenceUpdateSubscriber, ReferenceGetSubscribersByUser } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddSubscriberDto, UpdateSubscriberDto, GetSubscribersByUserDto } from '../../dtos/reference/subscriber.dto';
import { CatchError } from '../../error.filter';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload, UserRole } from '@myhome/interfaces';
import { RoleGuard } from '../../guards/role.guard';

@Controller('subscriber')
export class SubscriberController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-subscribers-by-user')
    async getSubscribersByUser(
        @Req() req: { user: IJWTPayload },
        @Body() dto: GetSubscribersByUserDto
    ) {
        try {
            return await this.rmqService.send<
                ReferenceGetSubscribersByUser.Request,
                ReferenceGetSubscribersByUser.Response
            >(ReferenceGetSubscribersByUser.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(201)
    @Post('add-subscriber')
    async addSubscriber(@Body() dto: AddSubscriberDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddSubscriber.Request,
                ReferenceAddSubscriber.Response
            >(ReferenceAddSubscriber.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(200)
    @Post('update-subscriber')
    async updateSubscriber(@Body() dto: UpdateSubscriberDto) {
        try {
            return await this.rmqService.send<
                ReferenceUpdateSubscriber.Request,
                ReferenceUpdateSubscriber.Response
            >(ReferenceUpdateSubscriber.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
