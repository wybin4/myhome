import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { ReferenceGetAllTypesOfService, ReferenceGetCommon } from '@myhome/contracts';
import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '../../guards/jwt.guard';

@Controller('common')
export class CommonController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-all-types-of-service')
    async getAllTypesOfService() {
        try {
            return await this.rmqService.send<
                ReferenceGetAllTypesOfService.Request,
                ReferenceGetAllTypesOfService.Response
            >(ReferenceGetAllTypesOfService.topic, new ReferenceGetAllTypesOfService.Request());
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-common')
    async getCommon() {
        try {
            return await this.rmqService.send<
                ReferenceGetCommon.Request,
                ReferenceGetCommon.Response
            >(ReferenceGetCommon.topic, new ReferenceGetCommon.Request());
        } catch (e) {
            CatchError(e);
        }
    }
}
