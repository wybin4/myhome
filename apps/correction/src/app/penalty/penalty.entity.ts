import { IPenalty } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('penaltys')
export class PenaltyEntity implements IPenalty {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    singlePaymentDocumentId: number;

    @Column('double', { nullable: false })
    outstandingPenalty: number;

    @Column('double', { nullable: false })
    originalPenalty: number;

    @Column({ nullable: false })
    createdAt: Date;

    constructor(data?: Partial<PenaltyEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            singlePaymentDocumentId: this.singlePaymentDocumentId,
            outstandingPenalty: this.outstandingPenalty,
            originalPenalty: this.originalPenalty,
            createdAt: this.createdAt,
        }
    }

}