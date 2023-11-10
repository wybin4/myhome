import { IApartment } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { HouseEntity } from './house.entity';
import { SubscriberEntity } from './subscriber.entity';
import { Min } from 'class-validator';
import { IndividualMeterEntity } from '../../meter/entities/individual-meter.entity';

@Entity('apartments')
export class ApartmentEntity implements IApartment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    houseId: number;

    @ManyToOne(() => HouseEntity, (house) => house.apartments)
    house: HouseEntity;

    @OneToMany(() => IndividualMeterEntity, (individualMeter) => individualMeter.apartment)
    individualMeters: IndividualMeterEntity[];

    @Column({ nullable: false })
    apartmentNumber: number;

    @Column({ nullable: false })
    totalArea: number;

    @Column({ nullable: false })
    livingArea: number;

    @Column({ nullable: false })
    @Min(1, { message: 'Количество прописанных должно быть больше нуля' })
    numberOfRegistered: number;

    @OneToOne(() => SubscriberEntity, (subscriber) => subscriber.apartment)
    subscriber: SubscriberEntity;

    constructor(data?: Partial<ApartmentEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get(): IApartment {
        return {
            id: this.id,
            houseId: this.houseId,
            apartmentNumber: this.apartmentNumber,
            totalArea: this.totalArea,
            livingArea: this.livingArea,
            numberOfRegistered: this.numberOfRegistered
        }
    }

    public getAddress(house: HouseEntity, withCity?: boolean): string {
        return `${house.getAddress(withCity)}, кв. ${this.apartmentNumber}`;
    }
}
