import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { GetSinglePaymentDocument } from '@myhome/contracts';
import { GetSinglePaymentDocumentDto } from '../../dtos/single-payment-document/single-payment-document.dto';

@Controller('single-payment-document')
export class SinglePaymentDocumentController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-single-payment-document')
    async getSinglePaymentDocument(@Body() dto: GetSinglePaymentDocumentDto) {
        try {
            return await this.rmqService.send<
                GetSinglePaymentDocument.Request,
                GetSinglePaymentDocument.Response
            >(GetSinglePaymentDocument.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }
}
