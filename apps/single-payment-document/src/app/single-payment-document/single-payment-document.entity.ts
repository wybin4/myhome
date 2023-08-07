import { CalculationState, ISinglePaymentDocument } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { GenericEnumTransformer } from '@myhome/constants';

@Entity('single_payment_documents')
export class SinglePaymentDocumentEntity implements ISinglePaymentDocument {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    managementCompanyId: number;

    @Column({ nullable: false })
    subscriberId: number;

    @Column('double', { nullable: true })
    amount?: number;

    @Column('double', { nullable: true })
    debt?: number;

    @Column('double', { nullable: true })
    penalty?: number;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(CalculationState),
        default: CalculationState.Started,
    })
    status: CalculationState;

    constructor(data?: Partial<SinglePaymentDocumentEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            managementCompanyId: this.managementCompanyId,
            subscriberId: this.subscriberId,
            amount: this.amount,
            debt: this.debt,
            penalty: this.penalty,
            createdAt: this.createdAt
        }
    }

    public setStatus(status: CalculationState) {
        this.status = status;
        return this;
    }
}