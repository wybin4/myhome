import { GenericEnumTransformer } from '@myhome/constants';
import { IServiceNotification, NotificationStatus, ServiceNotificationType, UserRole } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('service-notifications')
export class ServiceNotificationEntity implements IServiceNotification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    text: string;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(ServiceNotificationType)
    })
    type: ServiceNotificationType;

    @Column({ nullable: false })
    userId: number;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(UserRole)
    })
    userRole: UserRole;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    readAt?: Date;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(NotificationStatus)
    })
    status: NotificationStatus;

    constructor(data?: Partial<ServiceNotificationEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            id: this.id,
            userId: this.userId,
            userRole: this.userRole,
            description: this.description,
            readAt: this.readAt,
            status: this.status,
            title: this.title,
            text: this.text,
            type: this.type,
            createdAt: this.createdAt,
        }
    }

    public async update(status: NotificationStatus) {
        this.status = status;
        this.readAt = new Date();
        return this;
    }
}