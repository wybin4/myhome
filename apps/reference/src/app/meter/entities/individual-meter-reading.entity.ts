import { IIndividualMeterReading } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IndividualMeterEntity } from './individual-meter.entity';

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

    @ManyToOne(() => IndividualMeterEntity, (individualMeter) => individualMeter.individualMeterReadings)
    individualMeter: IndividualMeterEntity;

    constructor(data?: Partial<IndividualMeterReadingEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get(): IIndividualMeterReading {
        return {
            individualMeterId: this.individualMeterId,
            reading: this.reading,
            readAt: this.readAt
        }
    }
}
