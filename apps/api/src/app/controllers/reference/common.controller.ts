import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { ReferenceGetAllTypesOfService } from '@myhome/contracts';
import { Controller, HttpCode, Post } from '@nestjs/common';

@Controller('common')
export class CommonController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-all-types-of-service')
    async getCommonsByUser() {
        try {
            return await this.rmqService.send<
                ReferenceGetAllTypesOfService.Request,
                ReferenceGetAllTypesOfService.Response
            >(ReferenceGetAllTypesOfService.topic, new ReferenceGetAllTypesOfService.Request());
        } catch (e) {
            CatchError(e);
        }
    }
}
