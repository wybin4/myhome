import { BadRequestException, Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { EventAddHouseNotification } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../../error.filter';
import { AddHouseNotificationDto } from '../../../dtos/event/notification/house-notification.dto';
import { INCORRECT_USER_ROLE } from '@myhome/constants';
import { UserRole } from '@myhome/interfaces';
import { JWTAuthGuard } from '../../../guards/jwt.guard';

@Controller('house-notification')
export class HouseNotificationController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(201)
    @Post('add-house-notification')
    async addNotification(@Req() req, @Body() dto: AddHouseNotificationDto) {
        try {
            if (req.user.userRole === UserRole.ManagementCompany) {
                return await this.rmqService.send<
                    EventAddHouseNotification.Request,
                    EventAddHouseNotification.Response
                >(EventAddHouseNotification.topic, dto);
            } else {
                throw new BadRequestException(INCORRECT_USER_ROLE);
            }
        } catch (e) {
            CatchError(e);
        }
    }

}
