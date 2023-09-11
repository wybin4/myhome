import { IGeneralMeterReading } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
