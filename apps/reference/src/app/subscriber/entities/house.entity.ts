import { IHouse } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApartmentEntity } from './apartment.entity';

@Entity('houses')
export class HouseEntity implements IHouse {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => ApartmentEntity, (apartment) => apartment.house)
    apartments: ApartmentEntity[];

    @Column({ nullable: false })
    managementCompanyId: number;

    @Column({ nullable: false })
    city: string;

    @Column({ nullable: false })
    street: string;

    @Column({ nullable: false })
    houseNumber: string;

    @Column('double', { nullable: false })
    floorSpace: number;

    constructor(data?: Partial<HouseEntity>) {
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
            houseNumber: this.houseNumber,
            floorSpace: this.floorSpace
        }
    }
}
