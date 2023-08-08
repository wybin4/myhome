import { IDebt, IDebtDetail } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { JsonTransformer } from '@myhome/constants';

@Entity('debts')
export class DebtEntity implements IDebt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    singlePaymentDocumentId: number;

    @Column({
        type: 'json',
        transformer: new JsonTransformer(),
        nullable: false
    })
    outstandingDebt: IDebtDetail[];

    @Column({
        type: 'json',
        transformer: new JsonTransformer(),
        nullable: false
    })
    originalDebt: IDebtDetail[];

    @Column({ nullable: false })
    createdAt: Date;


    constructor(data?: Partial<DebtEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            singlePaymentDocumentId: this.singlePaymentDocumentId,
            outstandingDebt: this.outstandingDebt,
            originalDebt: this.originalDebt,
            createdAt: this.createdAt,
        }
    }

}