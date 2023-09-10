export namespace GetPaymentLink {
    export const topic = 'payment.get-payment-link.query';

    export class Request {

    }

    export class Response {
        paymentLink!: string;
    }
}
