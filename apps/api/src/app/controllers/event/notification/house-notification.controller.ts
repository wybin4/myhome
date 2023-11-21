import { Body, Controller, HttpCode, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { EventAddHouseNotification } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../../error.filter';
import { AddHouseNotificationDto } from '../../../dtos/event/notification/house-notification.dto';
import { UserRole } from '@myhome/interfaces';
import { JWTAuthGuard } from '../../../guards/jwt.guard';
import { RoleGuard } from '../../../guards/role.guard';

@Controller('house-notification')
export class HouseNotificationController {
    constructor(private readonly rmqService: RMQService) { }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(201)
    @Post('add-house-notification')
    async addNotification(@Body() dto: AddHouseNotificationDto) {
        try {
            return await this.rmqService.send<
                EventAddHouseNotification.Request,
                EventAddHouseNotification.Response
            >(EventAddHouseNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
