import { Controller, Body } from "@nestjs/common";
import { RMQValidate, RMQRoute } from "nestjs-rmq";
import { PaymentService } from "./payment.service";
import { GetPayment } from '@myhome/contracts';

@Controller()
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetPayment.topic)
    async getPayment(@Body() { id }: GetPayment.Request) {
        return this.paymentService.getPayment(id);
    }
}
