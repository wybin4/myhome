import { ISubscriber, SubscriberStatus, SubscriberStatusEnumTransformer } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Subscribers implements ISubscriber {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    ownerId: number;

    @Column({ nullable: false })
    apartmentId: number;

    @Column({ nullable: false })
    personalAccount: string;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: SubscriberStatusEnumTransformer,
        default: SubscriberStatus.Active,
    })
    status: SubscriberStatus;

    constructor(data?: Partial<Subscribers>) {
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
