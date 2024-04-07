import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { ReferenceAddMeterReading, ReferenceAddMeters, ReferenceGetMeterReadingsByUser, ReferenceGetMetersByUser } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { AddMeterReadingDto, AddMetersDto, GetMeterReadingsByUserDto, GetMetersByUserDto } from '../../dtos/reference/meter.dto';
import { CatchError } from '../../error.filter';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload, UserRole } from '@myhome/interfaces';
import { RoleGuard } from '../../guards/role.guard';

@Controller('meter')
export class MeterController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-meters-by-user')
    async getMetersByUser(
        @Req() req: { user: IJWTPayload },
        @Body() dto: GetMetersByUserDto
    ) {
        try {
            return await this.rmqService.send<
                ReferenceGetMetersByUser.Request,
                ReferenceGetMetersByUser.Response
            >(ReferenceGetMetersByUser.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-meter-readings-by-user')
    async getMeterReadingsByUser(
        @Req() req: { user: IJWTPayload },
        @Body() dto: GetMeterReadingsByUserDto
    ) {
        try {
            return await this.rmqService.send<
                ReferenceGetMeterReadingsByUser.Request,
                ReferenceGetMeterReadingsByUser.Response
            >(ReferenceGetMeterReadingsByUser.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(201)
    @Post('add-meters')
    async addMeters(@Body() dto: AddMetersDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddMeters.Request,
                ReferenceAddMeters.Response
            >(ReferenceAddMeters.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    // ИСПРАВИТЬ!!!!
    // @HttpCode(200)
    // @Post('update-meter')
    // async updateMeter(@Body() dto: UpdateMeterDto) {
    //     try {
    //         return await this.rmqService.send<
    //             ReferenceUpdateMeter.Request,
    //             ReferenceUpdateMeter.Response
    //         >(ReferenceUpdateMeter.topic, dto);
    //     } catch (e) {
    //         CatchError(e);
    //     }
    // }

    @UseGuards(JWTAuthGuard)
    @HttpCode(201)
    @Post('add-meter-reading')
    async addMeterReading(@Body() dto: AddMeterReadingDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddMeterReading.Request,
                ReferenceAddMeterReading.Response
            >(ReferenceAddMeterReading.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }
}
