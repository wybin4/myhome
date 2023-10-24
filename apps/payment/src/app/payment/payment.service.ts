import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "./payment.repository";
import { RMQService } from "nestjs-rmq";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly rmqService: RMQService,
        private readonly configService: ConfigService
    ) { }

    public async getPaymentLink() {
        // const qiwiApi = new QiwiBillPaymentsAPI(this.configService.get('SECRET_KEY'));
        // const QIWISettings = {
        //     amount: 200,
        //     billId: qiwiApi.generateId(),
        //     comment: 'Оплата ЖКХ',
        //     currency: 'RUB',
        //     successUrl: 'http://test.ru/',
        //     expirationDateTime: '2023-09-12T19:44:07',
        // };

        // const paymentLink = qiwiApi.createPaymentForm(QIWISettings);

        // //this.checkPayment(qiwiApi, QIWISettings.billId);

        // // добавить X-Api-Signature-SHA256

        // return { paymentLink: paymentLink }

        // const data = new URLSearchParams();
        // data.append('receiver', 'BCF69B2EDB93058FA839EE4DC09527824385AE69F5CE12F26DACFE8F5C144570');
        // data.append('quickpay-form', 'button');
        // data.append('sum', '1');
        // data.append('paymentType', 'AC'); // Выберите желаемый метод оплаты

        // async function makePayment() {
        //     try {
        //         const response = await axios.post('https://yoomoney.ru/quickpay/confirm', data);
        //         console.log(response.request._currentUrl);
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }

        // // Вызываем функцию для выполнения платежа
        // makePayment();
        const data = {}
    }

    private async checkPayment(qiwiApi, billId) {
        // qiwiApi.getBillInfo(billId).then(data => { // получаем данные о счете
        //     if (data.status.value == "PAID") { // Если статус счета оплачен (PAID)
        //         console.log("Оплата прошла успешно!")
        //     }
        //     else { // Если же нет.
        //         console.log("Вы не оплатили счет!")
        //     }
        // })
    }

}