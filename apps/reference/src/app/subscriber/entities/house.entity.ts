import { IHouse } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Houses implements IHouse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    managementCompanyId: number;

    @Column({ nullable: false })
    city: string;

    @Column({ nullable: false })
    street: string;

    @Column({ nullable: false })
    houseNumber: string;

    constructor(data?: Partial<Houses>) {
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
