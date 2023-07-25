import { IUnit } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('units')
export class UnitEnitity implements IUnit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    constructor(data?: Partial<UnitEnitity>) {
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
