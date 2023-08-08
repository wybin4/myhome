import { IPenaltyRule } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('penalty_rules')
export class PenaltyRuleEntity implements IPenaltyRule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 500, nullable: false })
    description: string;

    public get() {
        return {
            description: this.description,
        }
    }

}