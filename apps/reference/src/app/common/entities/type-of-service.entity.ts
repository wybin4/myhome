import { ITypeOfService } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('type_of_services')
export class TypeOfServiceEntity implements ITypeOfService {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    constructor(data?: Partial<TypeOfServiceEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getTypeOfService() {
        return {
            name: this.name
        }
    }
}
