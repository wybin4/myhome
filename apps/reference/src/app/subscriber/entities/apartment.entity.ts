import { IApartment } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { HouseEntity } from './house.entity';
import { SubscriberEntity } from './subscriber.entity';

@Entity('apartments')
export class ApartmentEntity implements IApartment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    houseId: number;

    @ManyToOne(() => HouseEntity, (house) => house.apartments)
    house: HouseEntity;

    @Column({ nullable: false })
    apartmentNumber: number;

    @Column({ nullable: false })
    totalArea: number;

    @Column({ nullable: false })
    livingArea: number;

    @OneToOne(() => SubscriberEntity, (subscriber) => subscriber.apartment)
    subscriber: SubscriberEntity;

    constructor(data?: Partial<ApartmentEntity>) {
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
