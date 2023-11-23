import { ISinglePaymentDocumentTotal } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('single_payment_document_totals')
export class SinglePaymentDocumentTotalEntity implements ISinglePaymentDocumentTotal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    managementCompanyId: number;

    @Column({ nullable: false })
    path: string;

    @Column({ nullable: false })
    createdAt: Date;

    constructor(data?: Partial<SinglePaymentDocumentTotalEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            managementCompanyId: this.managementCompanyId,
            path: this.path,
            createdAt: this.createdAt
        }
    }

}