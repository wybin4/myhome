import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { ReferenceAddHouse, ReferenceGetHousesByUser } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddHouseDto, GetHousesByUserDto } from '../../dtos/reference/house.dto';
import { CatchError } from '../../error.filter';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload, UserRole } from '@myhome/interfaces';
import { RoleGuard } from '../../guards/role.guard';

@Controller('house')
export class HouseController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-houses-by-user')
    async getHousesByUser(
        @Req() req: { user: IJWTPayload },
        @Body() dto: GetHousesByUserDto
    ) {
        try {
            return await this.rmqService.send<
                ReferenceGetHousesByUser.Request,
                ReferenceGetHousesByUser.Response
            >(ReferenceGetHousesByUser.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(201)
    @Post('add-house')
    async addHouse(@Req() req: { user: IJWTPayload }, @Body() dto: AddHouseDto) {
        try {
            const managementCompanyId = req.user.userId;
            return await this.rmqService.send<
                ReferenceAddHouse.Request,
                ReferenceAddHouse.Response
            >(ReferenceAddHouse.topic, { ...dto, managementCompanyId });
        } catch (e) {
            CatchError(e);
        }
    }

}
