import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { GetSinglePaymentDocumentDto } from '../../dtos/single-payment-document/single-payment-document.dto';
import { GetSinglePaymentDocument } from '@myhome/contracts';

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
            const pdf = Buffer.from(pdfBuffer);
            // Установка заголовков для отправки файла
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=example.pdf',
                'Content-Length': pdf.length
            });
            // Отправка PDF файла клиенту
            res.end(pdf);
        } catch (e) {
            CatchError(e);
        }

    }

}
