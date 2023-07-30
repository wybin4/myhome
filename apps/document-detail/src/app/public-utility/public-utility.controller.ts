import { Body, Controller, Post } from '@nestjs/common';
import { PublicUtilityService } from './public-utility.service';
import { GetDocumentDetail } from '@myhome/contracts';

@Controller('public-utility')
export class PublicUtilityController {
    constructor(
        private readonly publicUtilityService: PublicUtilityService,
    ) { }

    // @RMQValidate()
    // @RMQRoute(GetDocumentDetail.topic)
    // async getPublicUtility(@Body() { subscriberIds }: GetDocumentDetail.Request) {
    //     return this.publicUtilityService.getPublicUtility(subscriberId);
    // }

    @Post('get-public-utility')
    async getPublicUtility(@Body() dto: GetDocumentDetail.Request) {
        return this.publicUtilityService.getPublicUtility(dto);
    }

}
