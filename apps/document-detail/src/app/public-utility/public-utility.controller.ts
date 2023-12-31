import { Body, Controller } from '@nestjs/common';
import { PublicUtilityService } from './public-utility.service';
import { GetPublicUtilities } from '@myhome/contracts';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller('public-utility')
export class PublicUtilityController {
    constructor(
        private readonly publicUtilityService: PublicUtilityService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetPublicUtilities.topic)
    async getPublicUtility(@Body() dto: GetPublicUtilities.Request) {
        try {
            return await this.publicUtilityService.getPublicUtility(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
