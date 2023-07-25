import { IApartment } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { HouseEnitity } from './house.entity';
import { SubscriberEnitity } from './subscriber.entity';

@Entity('apartments')
export class ApartmentEnitity implements IApartment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    houseId: number;

    @ManyToOne(() => HouseEnitity, (house) => house.apartments)
    house: HouseEnitity;

    @Column({ nullable: false })
    apartmentNumber: number;

    @Column({ nullable: false })
    totalArea: number;

    @Column({ nullable: false })
    livingArea: number;

    @OneToOne(() => SubscriberEnitity, (subscriber) => subscriber.apartment)
    subscriber: SubscriberEnitity;

    constructor(data?: Partial<ApartmentEnitity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getApartment() {
        return {
            houseId: this.houseId,
            apartmentNumber: this.apartmentNumber,
            totalArea: this.totalArea,
            livingArea: this.livingArea
        }
    }
}
