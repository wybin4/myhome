import { JsonTransformer } from '@myhome/constants';
import { IPenaltyRule } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('penalty_rules')
export class PenaltyRuleEntity implements IPenaltyRule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 500, nullable: false })
    description: string;

    @Column({
        type: 'json',
        transformer: new JsonTransformer(),
        nullable: true
    })
    penaltyRule: string;


    constructor(data?: Partial<PenaltyRuleEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            description: this.description,
        }
    }

}