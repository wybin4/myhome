import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { CommonHouseNeedService } from './common-house-need.service';
import { GetDocumentDetail } from '@myhome/contracts';

@Controller()
export class CommonHouseNeedController {
    // constructor(
    //     private readonly commonHouseNeedService: CommonHouseNeedService,
    // ) { }

    // @RMQValidate()
    // @RMQRoute(GetDocumentDetail.topic)
    // async getCommonHouseNeed(@Body() { subscriberId }: GetDocumentDetail.Request) {
    //     return this.commonHouseNeedService.getCommonHouseNeed(subscriberId);
    // }

}
