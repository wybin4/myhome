import {  IIndividualMeterReading } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class IndividualMeterReadings implements IIndividualMeterReading {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    individualMeterId: number;

    @Column({ nullable: false })
    reading: string;

    @Column({ nullable: false })
    readAt: Date;


    constructor(data?: Partial<IndividualMeterReadings>) {
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
