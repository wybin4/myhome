import { BadRequestException, Body, ConflictException, Controller, HttpStatus, InternalServerErrorException, NotFoundException, Post, UnprocessableEntityException } from '@nestjs/common';
import { CommonHouseNeedService } from './common-house-need.service';
import { GetDocumentDetail } from '@myhome/contracts';

@Controller('common-house-need')
export class CommonHouseNeedController {
    constructor(
        private readonly commonHouseNeedService: CommonHouseNeedService,
    ) { }

    // @RMQValidate()
    // @RMQRoute(GetDocumentDetail.topic)
    @Post('get-common-house-need')
    async getCommonHouseNeed(@Body() dto: GetDocumentDetail.Request) {
        try {
            return this.commonHouseNeedService.getCommonHouseNeed(dto);
        }
        catch (e) {
            if (e.status === HttpStatus.NOT_FOUND) {
                throw new NotFoundException(e.message);
            } else if (e.status === HttpStatus.CONFLICT) {
                throw new ConflictException(e.message);
            } else if (e.status === HttpStatus.UNPROCESSABLE_ENTITY) {
                throw new UnprocessableEntityException(e.message);
            } else if (e.status === HttpStatus.BAD_REQUEST) {
                throw new BadRequestException(e.message);
            } else throw new InternalServerErrorException(e.message);
        }
    }

}
