import { ISubscriber, SubscriberStatus } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApartmentEntity } from './apartment.entity';
import { GenericEnumTransformer } from '@myhome/constants';

@Entity('subscribers')
export class SubscriberEntity implements ISubscriber {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    ownerId: number;

    @Column({ nullable: false })
    apartmentId: number;

    @OneToOne(() => ApartmentEntity, (apartment) => apartment.subscriber)
    @JoinColumn()
    apartment: ApartmentEntity;

    @Column({ nullable: false })
    personalAccount: string;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(SubscriberStatus),
        default: SubscriberStatus.Active,
    })
    status: SubscriberStatus;

    constructor(data?: Partial<SubscriberEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getSubscriber() {
        return {
            ownerId: this.ownerId,
            apartmentId: this.apartmentId,
            personalAccount: this.personalAccount,
            status: this.status,
        }
    }

    public archieveSubscriber() {
        this.status = SubscriberStatus.Archieved;
        return this;
    }
}
