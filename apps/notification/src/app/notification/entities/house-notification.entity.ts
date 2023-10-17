import { GenericEnumTransformer } from '@myhome/constants';
import { IHouseNotification, HouseNotificationType } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('house-notifications')
export class HouseNotificationEntity implements IHouseNotification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({ nullable: false })
    houseId: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    text: string;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(HouseNotificationType)
    })
    type: HouseNotificationType;

    constructor(data?: Partial<HouseNotificationEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            id: this.id,
            houseId: this.houseId,
            title: this.title,
            text: this.text,
            type: this.type,
            createdAt: this.createdAt,
        }
    }
}