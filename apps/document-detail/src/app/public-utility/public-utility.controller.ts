import { Body, ConflictException, Controller, HttpStatus, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common';
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
        try { return this.publicUtilityService.getPublicUtility(dto); }
        catch (e) {
            if (e.code === HttpStatus.NOT_FOUND) {
                throw new NotFoundException(e.message);
            } else if (e.code === HttpStatus.CONFLICT) {
                throw new ConflictException(e.message);
            } else throw new InternalServerErrorException(e.message);
        }
    }

}
