import { CalculationState, ISinglePaymentDocument } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { GenericEnumTransformer } from '@myhome/constants';

@Entity('single_payment_documents')
export class SinglePaymentDocumentEntity implements ISinglePaymentDocument {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    totalId?: number;

    @Column({ nullable: false })
    subscriberId: number;

    @Column('double', { nullable: true })
    amount?: number;

    @Column('double', { nullable: true })
    debt?: number;

    @Column('double', { nullable: true })
    penalty?: number;

    @Column('double', { nullable: true })
    deposit?: number;

    @Column({ nullable: true })
    path?: string;

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
            totalId: this.totalId,
            subscriberId: this.subscriberId,
            amount: this.amount,
            debt: this.debt,
            penalty: this.penalty,
            deposit: this.deposit,
            path: this.path,
            createdAt: this.createdAt
        }
    }

    public setStatus(status: CalculationState) {
        this.status = status;
        return this;
    }

    public setAmount(amount: number) {
        this.amount = amount;
        return this;
    }

    public setCorrection(debt: number, penalty: number, deposit: number) {
        this.debt = debt;
        this.penalty = penalty;
        this.deposit = deposit;
        return this;
    }

    public setTotal(totalId: number, path: string) {
        this.totalId = totalId;
        this.path = path;
        return this;
    }
}