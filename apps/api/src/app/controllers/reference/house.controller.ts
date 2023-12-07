import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { ReferenceGetHousesByUser, ReferenceAddHouses } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddHousesDto, GetHousesByUserDto } from '../../dtos/reference/house.dto';
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
    @Post('add-houses')
    async addHouses(@Req() req: { user: IJWTPayload }, @Body() dto: AddHousesDto) {
        try {
            const managementCompanyId = req.user.userId;
            return await this.rmqService.send<
                ReferenceAddHouses.Request,
                ReferenceAddHouses.Response
            >(ReferenceAddHouses.topic, { ...dto, managementCompanyId });
        } catch (e) {
            CatchError(e);
        }
    }
}
