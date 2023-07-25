import { IUnit } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('units')
export class UnitEntity implements IUnit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    constructor(data?: Partial<UnitEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getUnit() {
        return {
            name: this.name
        }
    }
}
