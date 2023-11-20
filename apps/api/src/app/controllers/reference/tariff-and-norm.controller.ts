import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ReferenceAddTariffOrNorm, ReferenceGetTariffsOrNormsByUser, ReferenceUpdateTariffOrNorm } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddTariffAndNormDto, GetTariffsAndNormsByUserDto, UpdateTariffAndNormDto } from '../../dtos/reference/tariff-and-norm.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';

@Controller('tariff-and-norm')
export class TariffAndNormController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-tariffs-and-norms-by-user')
    async getTariffsAndNormsByUser(
        @Req() req,
        @Body() dto: GetTariffsAndNormsByUserDto
    ) {
        try {
            return await this.rmqService.send<
                ReferenceGetTariffsOrNormsByUser.Request,
                ReferenceGetTariffsOrNormsByUser.Response
            >(ReferenceGetTariffsOrNormsByUser.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-tariff-and-norm')
    async addTariffAndNorm(@Body() dto: AddTariffAndNormDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddTariffOrNorm.Request,
                ReferenceAddTariffOrNorm.Response
            >(ReferenceAddTariffOrNorm.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('update-tariff-and-norm')
    async updateHouse(@Body() dto: UpdateTariffAndNormDto) {
        try {
            return await this.rmqService.send<
                ReferenceUpdateTariffOrNorm.Request,
                ReferenceUpdateTariffOrNorm.Response
            >(ReferenceUpdateTariffOrNorm.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }
}
