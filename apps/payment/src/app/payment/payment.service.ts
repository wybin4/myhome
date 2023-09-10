import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "./payment.repository";
import { RMQService } from "nestjs-rmq";
import QiwiBillPaymentsAPI from '@qiwi/bill-payments-node-js-sdk';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly rmqService: RMQService,
        private readonly configService: ConfigService
    ) { }

    public async getPaymentLink() {
        const qiwiApi = new QiwiBillPaymentsAPI(this.configService.get('SECRET_KEY'));
        const QIWISettings = {
            amount: 200,
            billId: qiwiApi.generateId(),
            comment: 'Оплата ЖКХ',
            currency: 'RUB',
            successUrl: 'http://test.ru/',
            expirationDateTime: '2023-09-12T19:44:07',
        };

        const paymentLink = qiwiApi.createPaymentForm(QIWISettings);

        //this.checkPayment(qiwiApi, QIWISettings.billId);

        // добавить X-Api-Signature-SHA256

        return { paymentLink: paymentLink }
    }

    private async checkPayment(qiwiApi, billId) {
        qiwiApi.getBillInfo(billId).then(data => { // получаем данные о счете
            if (data.status.value == "PAID") { // Если статус счета оплачен (PAID)
                console.log("Оплата прошла успешно!")
            }
            else { // Если же нет.
                console.log("Вы не оплатили счет!")
            }
        })
    }

}