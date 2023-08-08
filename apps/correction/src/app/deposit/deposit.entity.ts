import { IDeposit } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('deposits')
export class DepositEntity implements IDeposit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    singlePaymentDocumentId: number;

    @Column('double', { nullable: false })
    outstandingDeposit: number;

    @Column('double', { nullable: false })
    originalDeposit: number;

    @Column({ nullable: false })
    createdAt: Date;

    constructor(data?: Partial<DepositEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            singlePaymentDocumentId: this.singlePaymentDocumentId,
            outstandingDeposit: this.outstandingDeposit,
            originalDeposit: this.originalDeposit,
            createdAt: this.createdAt,
        }
    }

}