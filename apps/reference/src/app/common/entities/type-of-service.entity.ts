import { ITypeOfService } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TypeOfServiceEnitity implements ITypeOfService {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    individualMeterId: number;

    @Column({ nullable: false })
    reading: number;

    @Column({ nullable: false })
    readAt: Date;

    constructor(data?: Partial<TypeOfServiceEnitity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getTypeOfService() {
        return {
            individualMeterId: this.individualMeterId,
            reading: this.reading,
            readAt: this.readAt
        }
    }
}
