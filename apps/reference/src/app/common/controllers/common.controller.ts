import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { CommonService } from '../services/common.service';
import { ReferenceGetCommon } from '@myhome/contracts';

@Controller('common')
export class CommonController {
    constructor(
        private readonly commonService: CommonService,
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetCommon.topic)
    // eslint-disable-next-line no-empty-pattern
    async getCommon(@Body() { }: ReferenceGetCommon.Request): Promise<ReferenceGetCommon.Response> {
        try {
            return await this.commonService.getCommon();
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
