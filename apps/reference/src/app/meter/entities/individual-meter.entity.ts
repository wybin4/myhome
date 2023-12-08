import { GenericEnumTransformer } from '@myhome/constants';
import { IIndividualMeter, MeterStatus, SubscriberStatus } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ApartmentEntity } from '../../subscriber/entities/apartment.entity';
import { IndividualMeterReadingEntity } from './individual-meter-reading.entity';
import { TypeOfServiceEntity } from '../../common/entities/type-of-service.entity';

@Entity('individual_meters')
export class IndividualMeterEntity implements IIndividualMeter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    typeOfServiceId: number;

    @Column({ nullable: false })
    apartmentId: number;

    @ManyToOne(() => ApartmentEntity, (apartment) => apartment.individualMeters)
    apartment: ApartmentEntity;

    @OneToMany(() => IndividualMeterReadingEntity, (individualMeterReading) => individualMeterReading.individualMeter)
    individualMeterReadings: IndividualMeterReadingEntity[];

    @ManyToOne(() => TypeOfServiceEntity, (typeOfService) => typeOfService.individualMeters)
    typeOfService: TypeOfServiceEntity;

    @Column({ nullable: false })
    factoryNumber: string;

    @Column({ nullable: false })
    verifiedAt: Date;

    @Column({ nullable: false })
    issuedAt: Date;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(MeterStatus),
        default: SubscriberStatus.Active,
    })
    status: MeterStatus;

    constructor(data?: Partial<IndividualMeterEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get(): IIndividualMeter {
        return {
            id: this.id,
            typeOfServiceId: this.typeOfServiceId,
            apartmentId: this.apartmentId,
            factoryNumber: this.factoryNumber,
            verifiedAt: this.verifiedAt,
            issuedAt: this.issuedAt,
            status: this.status,
        }
    }

    public async update(verifiedAt: Date, issuedAt: Date) {
        this.verifiedAt = verifiedAt;
        this.issuedAt = issuedAt;
        return this;
    }

    public async expire() {
        this.status = MeterStatus.Archieve;
        return this;
    }

}
