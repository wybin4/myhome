import { GenericEnumTransformer } from '@myhome/constants';
import { AppealStatus, AppealType, IAppealEntity } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('appeals')
export class AppealEntity implements IAppealEntity {
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
        const data = JSON.parse(this.data);
        return {
            id: this.id,
            managementCompanyId: this.managementCompanyId,
            typeOfAppeal: this.typeOfAppeal,
            subscriberId: this.subscriberId,
            createdAt: this.createdAt,
            status: this.status,
            data: data
        }
    }

    public update(status: AppealStatus) {
        this.status = status;
        return this;
    }

}