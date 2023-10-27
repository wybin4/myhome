import { GenericEnumTransformer } from '@myhome/constants';
import { AppealStatus, AppealType, IAppeal } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('appeals')
export class AppealEntity implements IAppeal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    managementCompanyId: number;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(AppealType),
    })
    typeOfAppeal: AppealType;

    @Column({ nullable: false })
    subscriberId: number;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(AppealStatus),
        default: AppealStatus.Processing,
    })
    status: AppealStatus;

    @Column({ nullable: false })
    data: string;

    constructor(data?: Partial<AppealEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            id: this.id,
            managementCompanyId: this.managementCompanyId,
            typeOfAppeal: this.typeOfAppeal,
            subscriberId: this.subscriberId,
            createdAt: this.createdAt,
            status: this.status,
            data: this.data,
        }
    }

    public async close() {
        this.status = AppealStatus.Closed;
        return this;
    }

    public async reject() {
        this.status = AppealStatus.Rejected;
        return this;
    }

}