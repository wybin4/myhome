import { GenericEnumTransformer } from '@myhome/constants';
import { IIndividualMeter, MeterStatus, SubscriberStatus } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class IndividualMeterEnitity implements IIndividualMeter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    typeOfServiceId: number;

    @Column({ nullable: false })
    apartmentId: number;

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

    constructor(data?: Partial<IndividualMeterEnitity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getIndividualMeter() {
        return {
            typeOfServiceId: this.typeOfServiceId,
            apartmentId: this.apartmentId,
            factoryNumber: this.factoryNumber,
            verifiedAt: this.verifiedAt,
            issuedAt: this.issuedAt,
            status: this.status,
        }
    }

    public async updateIndividualMeter(verifiedAt: Date) {
        this.verifiedAt = verifiedAt;
        return this;
    }

    public async expire() {
        this.status = MeterStatus.Archieve;
        return this;
    }

}
