import { CommonHouseNeedService } from './common-house-need.service';
import { GetCommonHouseNeeds } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller('common-house-need')
export class CommonHouseNeedController {
    constructor(
        private readonly commonHouseNeedService: CommonHouseNeedService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetCommonHouseNeeds.topic)
    async getCommonHouseNeed(@Body() dto: GetCommonHouseNeeds.Request) {
        try {
            return this.commonHouseNeedService.getCommonHouseNeed(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
