import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddTariffOrNorm, ReferenceGetAllTariffs, ReferenceGetTariffsOrNormsByMCId, ReferenceUpdateTariffOrNorm } from '@myhome/contracts';
import { TariffAndNormService } from './tariff-and-norm.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class TariffAndNormController {
    constructor(
        private readonly tariffAndNormService: TariffAndNormService,
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetTariffsOrNormsByMCId.topic)
    async getTariffsAndNormsByMCId(@Body() { managementCompanyId, type }: ReferenceGetTariffsOrNormsByMCId.Request) {
        try {
            return this.tariffAndNormService.getTariffsAndNormsByMCId(managementCompanyId, type);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceAddTariffOrNorm.topic)
    async addTariffAndNorm(@Body() dto: ReferenceAddTariffOrNorm.Request) {
        try {
            return this.tariffAndNormService.addTariffAndNorm(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceUpdateTariffOrNorm.topic)
    async updateTariffAndNorm(@Body() dto: ReferenceUpdateTariffOrNorm.Request) {
        try {
            return this.tariffAndNormService.updateTariffAndNorm(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetAllTariffs.topic)
    async getAllTariffs(@Body() dto: ReferenceGetAllTariffs.Request) {
        try {
            return this.tariffAndNormService.getAllTariffs(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}

