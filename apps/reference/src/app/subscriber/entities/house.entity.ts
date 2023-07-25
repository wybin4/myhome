import { IHouse } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApartmentEnitity } from './apartment.entity';

@Entity('houses')
export class HouseEnitity implements IHouse {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => ApartmentEnitity, (apartment) => apartment.house)
    apartments: ApartmentEnitity[];

    @Column({ nullable: false })
    managementCompanyId: number;

    @Column({ nullable: false })
    city: string;

    @Column({ nullable: false })
    street: string;

    @Column({ nullable: false })
    houseNumber: string;

    constructor(data?: Partial<HouseEnitity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public async updateHouse(managementCompanyId: number) {
        this.managementCompanyId = managementCompanyId;
        return this;
    }

    public getHouse() {
        return {
            managementCompanyId: this.managementCompanyId,
            city: this.city,
            street: this.street,
            houseNumber: this.houseNumber
        }
    }
}
