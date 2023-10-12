import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { CorrectionGetKeyRate } from '@myhome/contracts';
import { GetKeyRateDto } from '../../dtos/correction/cbr.dto';

@Controller('cbr')
export class CBRController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-key-rate')
    async getKeyRate(@Body() dto: GetKeyRateDto) {
        try {
            return await this.rmqService.send<
                CorrectionGetKeyRate.Request,
                CorrectionGetKeyRate.Response
            >(CorrectionGetKeyRate.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }
}
