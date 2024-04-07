import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { CorrectionGetChargeChart, CorrectionGetCharges, CorrectionGetDebts } from '@myhome/contracts';
import { IJWTPayload } from '@myhome/interfaces';
import { GetChargeChartDto, GetChargesDto, GetDebtsDto } from '../../dtos/correction/debt.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';

@Controller('debt')
export class DebtController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-debts')
    async getDebts(@Req() req: { user: IJWTPayload }, @Body() dto: GetDebtsDto) {
        try {
            return await this.rmqService.send<
                CorrectionGetDebts.Request,
                CorrectionGetDebts.Response
            >(CorrectionGetDebts.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-charges')
    async getCharges(@Req() req: { user: IJWTPayload }, @Body() dto: GetChargesDto) {
        try {
            return await this.rmqService.send<
                CorrectionGetCharges.Request,
                CorrectionGetCharges.Response
            >(CorrectionGetCharges.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-charge-chart')
    async getChartData(@Req() req: { user: IJWTPayload }, @Body() dto: GetChargeChartDto) {
        try {
            return await this.rmqService.send<
                CorrectionGetChargeChart.Request,
                CorrectionGetChargeChart.Response
                >(CorrectionGetChargeChart.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }
}
