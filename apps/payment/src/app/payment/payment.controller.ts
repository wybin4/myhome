import { Controller, Body} from "@nestjs/common";
import { RMQValidate, RMQRoute } from "nestjs-rmq";
import { PaymentService } from "./payment.service";
import { GetPaymentLink } from '@myhome/contracts';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetPaymentLink.topic)
    // eslint-disable-next-line no-empty-pattern
    async getPayment(@Body() {  }: GetPaymentLink.Request) {
        return this.paymentService.getPaymentLink();
    }
}
