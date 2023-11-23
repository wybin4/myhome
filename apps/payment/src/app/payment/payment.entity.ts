import { IPayment } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('payments')
export class PaymentEntity implements IPayment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    singlePaymentDocumentId: number;

    @Column({ nullable: false })
    payedAt: Date;

    constructor(data?: Partial<PaymentEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            singlePaymentDocumentId: this.singlePaymentDocumentId,
            payedAt: this.payedAt
        }
    }

}