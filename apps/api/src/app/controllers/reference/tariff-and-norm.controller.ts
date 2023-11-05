import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReferenceAddTariffOrNorm, ReferenceGetTariffsOrNormsByMCId, ReferenceUpdateTariffOrNorm } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddTariffAndNormDto, GetTariffsAndNormsByMCIdDto, UpdateTariffAndNormDto } from '../../dtos/reference/tariff-and-norm.dto';

@Controller('tariff-and-norm')
export class TariffAndNormController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-tariffs-and-norms-by-mcid')
    async getTariffsAndNormsByMCId(@Body() dto: GetTariffsAndNormsByMCIdDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetTariffsOrNormsByMCId.Request,
                ReferenceGetTariffsOrNormsByMCId.Response
            >(ReferenceGetTariffsOrNormsByMCId.topic, dto);
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
