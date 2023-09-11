import { GenericEnumTransformer } from '@myhome/constants';
import { IGeneralMeter, MeterStatus, SubscriberStatus } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('general_meters')
export class GeneralMeterEntity implements IGeneralMeter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    typeOfServiceId: number;

    @Column({ nullable: false })
    houseId: number;

    @Column({ nullable: false })
    factoryNumber: string;

    @Column({ nullable: false })
    verifiedAt: Date;

    @Column({ nullable: false })
    issuedAt: Date;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(SubscriberStatus),
        default: SubscriberStatus.Active,
    })
    status: MeterStatus;

    constructor(data?: Partial<GeneralMeterEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get(): IGeneralMeter {
        return {
            typeOfServiceId: this.typeOfServiceId,
            houseId: this.houseId,
            factoryNumber: this.factoryNumber,
            verifiedAt: this.verifiedAt,
            issuedAt: this.issuedAt,
            status: this.status,
        }
    }

    public async update(verifiedAt: Date) {
        this.verifiedAt = verifiedAt;
        return this;
    }

    public async expire() {
        this.status = MeterStatus.Archieve;
        return this;
    }
}
