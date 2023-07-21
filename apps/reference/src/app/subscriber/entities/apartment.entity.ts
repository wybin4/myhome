import { IApartment } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Apartments implements IApartment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    houseId: number;

    @Column({ nullable: false })
    apartmentNumber: number;

    @Column({ nullable: false })
    totalArea: number;

    @Column({ nullable: false })
    livingArea: number;

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
