import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AcceptPayment, GetPaymentsByUser } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { IJWTPayload } from '@myhome/interfaces';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { AcceptPaymentDto, GetPaymentsByUserDto } from '../../dtos/payment/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly rmqService: RMQService,
  ) { }

  @HttpCode(200)
  @UseGuards(JWTAuthGuard)
  @Post('get-payments-by-user')
  async register(@Req() req: { user: IJWTPayload }, @Body() dto: GetPaymentsByUserDto) {
    try {
      return await this.rmqService.send<
        GetPaymentsByUser.Request,
        GetPaymentsByUser.Response
      >(GetPaymentsByUser.topic, { ...dto, ...req.user });
    } catch (e) {
      CatchError(e);
    }
  }

  @HttpCode(200)
  @Post('accept-payment')
  async acceptPayment(@Body() dto: AcceptPaymentDto) {
    const { label, amount } = dto;
    try {
      return await this.rmqService.send<
        AcceptPayment.Request,
        AcceptPayment.Response
      >(AcceptPayment.topic, {
        singlePaymentDocumentId: parseInt(label),
        amount: parseFloat(amount)
      });
    } catch (e) {
      CatchError(e);
    }
  }

}