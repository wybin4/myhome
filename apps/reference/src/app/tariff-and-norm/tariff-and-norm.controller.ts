import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddTariffOrNorm, ReferenceGetTariffOrNorm, ReferenceUpdateTariffOrNorm } from '@myhome/contracts';
import { TariffAndNormService } from './tariff-and-norm.service';

@Controller()
export class TariffAndNormController {
    constructor(
        private readonly tariffAndNormService: TariffAndNormService,
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetTariffOrNorm.topic)
    async getTariffAndNorm(@Body() { id, type }: ReferenceGetTariffOrNorm.Request) {
        return this.tariffAndNormService.getTariffAndNorm(id, type);
    }

    @RMQValidate()
    @RMQRoute(ReferenceAddTariffOrNorm.topic)
    async addTariffAndNorm(@Body() dto: ReferenceAddTariffOrNorm.Request) {
        return this.tariffAndNormService.addTariffAndNorm(dto);
    }

    @RMQValidate()
    @RMQRoute(ReferenceUpdateTariffOrNorm.topic)
    async updateTariffAndNorm(@Body() dto: ReferenceUpdateTariffOrNorm.Request) {
        return this.tariffAndNormService.updateTariffAndNorm(dto);
    }
}

