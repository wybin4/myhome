import { IIndividualMeterReading } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('individual_meter_readings')
export class IndividualMeterReadingEntity implements IIndividualMeterReading {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    individualMeterId: number;

    @Column('double', { nullable: false })
    reading: number;

    @Column({ nullable: false })
    readAt: Date;

    constructor(data?: Partial<IndividualMeterReadingEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getIndividualMeterReading() {
        return {
            individualMeterId: this.individualMeterId,
            reading: this.reading,
            readAt: this.readAt
        }
    }
}
