import { SinglePaymentDocumentService } from './single-payment-document.service';
import { GetSinglePaymentDocument } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller()
export class SinglePaymentDocumentController {
    constructor(
        private readonly singlePaymentDocumentService: SinglePaymentDocumentService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetSinglePaymentDocument.topic)
    async getSinglePaymentDocument(@Body() dto: GetSinglePaymentDocument.Request) {
        return this.singlePaymentDocumentService.getSinglePaymentDocument(dto);
    }

}
