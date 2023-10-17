import { IGeneralMeterReading } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { GeneralMeterEntity } from './general-meter.entity';

@Entity('general_meter_readings')
export class GeneralMeterReadingEntity implements IGeneralMeterReading {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    generalMeterId: number;

    @Column('double', { nullable: false })
    reading: number;

    @Column({ nullable: false })
    readAt: Date;

    @ManyToOne(() => GeneralMeterEntity, (generalMeter) => generalMeter.generalMeterReadings)
    generalMeter: GeneralMeterEntity;

    constructor(data?: Partial<GeneralMeterReadingEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get(): IGeneralMeterReading {
        return {
            generalMeterId: this.generalMeterId,
            reading: this.reading,
            readAt: this.readAt,
        }
    }
}
