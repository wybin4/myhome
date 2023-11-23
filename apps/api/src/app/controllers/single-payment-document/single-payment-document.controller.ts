import { Body, Controller, HttpCode, Post, Req, Res, SetMetadata, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { GetSinglePaymentDocumentDto, GetSinglePaymentDocumentsByUserDto } from '../../dtos/single-payment-document/single-payment-document.dto';
import { GetSinglePaymentDocument, GetSinglePaymentDocumentsByUser } from '@myhome/contracts';
import { IJWTPayload, UserRole } from '@myhome/interfaces';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { RoleGuard } from '../../guards/role.guard';

@Controller('single-payment-document')
export class SinglePaymentDocumentController {
    constructor(private readonly rmqService: RMQService) { }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(200)
    @Post('get-single-payment-document')
    async getSinglePaymentDocument(@Req() req: { user: IJWTPayload }, @Body() dto: GetSinglePaymentDocumentDto, @Res() res) {
        try {
            const managementCompanyId = req.user.userId;
            const { pdfBuffer } = await this.rmqService.send<
                GetSinglePaymentDocument.Request,
                GetSinglePaymentDocument.Response
            >(GetSinglePaymentDocument.topic, { ...dto, managementCompanyId });
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

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-single-payment-documents-by-user')
    async getSinglePaymentDocumentsByUser(@Req() req: { user: IJWTPayload }, @Body() dto: GetSinglePaymentDocumentsByUserDto) {
        try {
            return await this.rmqService.send<
                GetSinglePaymentDocumentsByUser.Request,
                GetSinglePaymentDocumentsByUser.Response
            >(GetSinglePaymentDocumentsByUser.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

}
