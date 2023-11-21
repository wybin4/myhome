import { SinglePaymentDocumentService } from './services/single-payment-document.service';
import { GetSinglePaymentDocument, CheckSinglePaymentDocument, GetSinglePaymentDocumentsByUser, GetSinglePaymentDocumentsBySId } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller('single-payment-document')
export class SinglePaymentDocumentController {
    constructor(
        private readonly singlePaymentDocumentService: SinglePaymentDocumentService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetSinglePaymentDocument.topic)
    async getSinglePaymentDocument(@Body() dto: GetSinglePaymentDocument.Request) {
        try {
            return await this.singlePaymentDocumentService.getSinglePaymentDocument(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(GetSinglePaymentDocumentsByUser.topic)
    async getSinglePaymentDocumentsByMCId(@Body() dto: GetSinglePaymentDocumentsByUser.Request) {
        try {
            return await this.singlePaymentDocumentService.getSinglePaymentDocumentsByMCId(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(GetSinglePaymentDocumentsBySId.topic)
    async getSinglePaymentDocumentsBySId(@Body() dto: GetSinglePaymentDocumentsBySId.Request) {
        try {
            return await this.singlePaymentDocumentService.getSinglePaymentDocumentsBySId(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(CheckSinglePaymentDocument.topic)
    async checkSinglePaymentDocument(@Body() dto: CheckSinglePaymentDocument.Request) {
        try {
            return await this.singlePaymentDocumentService.checkSinglePaymentDocument(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
