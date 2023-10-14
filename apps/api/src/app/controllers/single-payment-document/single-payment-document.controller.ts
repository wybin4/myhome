import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { GetSinglePaymentDocumentDto, GetSinglePaymentDocumentsByMCIdDto, GetSinglePaymentDocumentsBySIdDto } from '../../dtos/single-payment-document/single-payment-document.dto';
import { GetSinglePaymentDocument, GetSinglePaymentDocumentsByMCId, GetSinglePaymentDocumentsBySId } from '@myhome/contracts';

@Controller('single-payment-document')
export class SinglePaymentDocumentController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-single-payment-document')
    async getSinglePaymentDocument(@Body() dto: GetSinglePaymentDocumentDto, @Res() res) {
        try {
            const { pdfBuffer } = await this.rmqService.send<
                GetSinglePaymentDocument.Request,
                GetSinglePaymentDocument.Response
            >(GetSinglePaymentDocument.topic, dto);
            const pdf = Buffer.from(pdfBuffer, 'binary');
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=example.pdf',
                'Content-Length': pdf.length
            });
            res.end(pdf);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-single-payment-documents-by-mcid')
    async getSinglePaymentDocumentsByMCId(@Body() dto: GetSinglePaymentDocumentsByMCIdDto) {
        try {
            return await this.rmqService.send<
                GetSinglePaymentDocumentsByMCId.Request,
                GetSinglePaymentDocumentsByMCId.Response
            >(GetSinglePaymentDocumentsByMCId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-single-payment-documents-by-sid')
    async getSinglePaymentDocumentsBySId(@Body() dto: GetSinglePaymentDocumentsBySIdDto) {
        try {
            return await this.rmqService.send<
                GetSinglePaymentDocumentsBySId.Request,
                GetSinglePaymentDocumentsBySId.Response
                >(GetSinglePaymentDocumentsBySId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
