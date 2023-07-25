import { IGeneralMeterReading } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('general_meter_readings')
export class GeneralMeterReadingEnitity implements IGeneralMeterReading {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    generalMeterId: number;

    @Column({ nullable: false })
    reading: number;

    @Column({ nullable: false })
    readAt: Date;

    constructor(data?: Partial<GeneralMeterReadingEnitity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getGeneralMeterReading() {
        return {
            generalMeterId: this.generalMeterId,
            reading: this.reading,
            readAt: this.readAt,
        }
    }
}
