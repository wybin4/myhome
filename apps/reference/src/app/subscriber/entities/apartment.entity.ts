import { IApartment } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { Houses } from './house.entity';
import { Subscribers } from './subscriber.entity';

@Entity()
export class Apartments implements IApartment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    houseId: number;

    @ManyToOne(() => Houses, (house) => house.apartments)
    house: Houses;

    @Column({ nullable: false })
    apartmentNumber: number;

    @Column({ nullable: false })
    totalArea: number;

    @Column({ nullable: false })
    livingArea: number;

    @OneToOne(() => Subscribers, (subscriber) => subscriber.apartment)
    subscriber: Subscribers;

    constructor(data?: Partial<Apartments>) {
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
