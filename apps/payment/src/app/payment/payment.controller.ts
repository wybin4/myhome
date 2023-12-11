import { Controller, Body } from "@nestjs/common";
import { RMQValidate, RMQRoute, RMQError } from "nestjs-rmq";
import { PaymentService } from "./payment.service";
import { AcceptPayment, GetPaymentsByUser } from '@myhome/contracts';
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetPaymentsByUser.topic)
    async getPayment(@Body() dto: GetPaymentsByUser.Request) {
        try {
            return this.paymentService.getPaymentsByUser(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(AcceptPayment.topic)
    async acceptPayment(@Body() dto: AcceptPayment.Request) {
        try {
            return this.paymentService.acceptPayment(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
