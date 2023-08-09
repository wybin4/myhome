import { IPenaltyCalculationRule } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('penalty_calculation_rules')
export class PenaltyCalculationRuleEntity implements IPenaltyCalculationRule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    typeOfServiceId: number;

    @Column({ nullable: false })
    managementCompanyId: number;

    @Column({ nullable: false })
    penaltyRuleId: string;

    constructor(data?: Partial<IPenaltyCalculationRule>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            typeOfServiceId: this.typeOfServiceId,
            managementCompanyId: this.managementCompanyId,
            penaltyRuleId: this.penaltyRuleId,
        }
    }

}