import { GenericEnumTransformer } from '@myhome/constants';
import { INotification, NotificationStatus, NotificationType, UserRole } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notifications')
export class NotificationEntity implements INotification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(NotificationStatus),
        default: NotificationStatus.Unread,
    })
    status: NotificationStatus;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(UserRole),
        default: UserRole.Owner,
    })
    userRole: UserRole;

    @Column({ nullable: false })
    userId: number;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(NotificationType)
    })
    notificationType: NotificationType;

    @Column({ nullable: false })
    message: string;

    @Column({ nullable: true })
    readAt?: Date;

    constructor(data?: Partial<NotificationEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            userId: this.userId,
            userRole: this.userRole,
            notificationType: this.notificationType,
            message: this.message,
            createdAt: this.createdAt,
            readAt: this.readAt,
            status: this.status,
        }
    }

    public async read() {
        this.status = NotificationStatus.Read;
        return this;
    }

}