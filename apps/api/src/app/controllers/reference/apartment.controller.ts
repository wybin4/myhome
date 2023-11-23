import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { ReferenceAddApartment, ReferenceGetApartmentsByUser } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddApartmentDto, GetApartmentsByUserDto } from '../../dtos/reference/apartment.dto';
import { CatchError } from '../../error.filter';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload, UserRole } from '@myhome/interfaces';
import { RoleGuard } from '../../guards/role.guard';

@Controller('apartment')
export class ApartmentController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-apartments-by-user')
    async getApartmentsByUser(
        @Req() req: { user: IJWTPayload },
        @Body() dto: GetApartmentsByUserDto
    ) {
        try {
            return await this.rmqService.send<
                ReferenceGetApartmentsByUser.Request,
                ReferenceGetApartmentsByUser.Response
            >(ReferenceGetApartmentsByUser.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(201)
    @Post('add-apartment')
    async addApartment(@Body() dto: AddApartmentDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddApartment.Request,
                ReferenceAddApartment.Response
            >(ReferenceAddApartment.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
