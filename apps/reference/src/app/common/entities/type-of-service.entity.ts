import { ITypeOfService } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CommonHouseNeedTariffEntity } from '../../tariff-and-norm/entities/house-tariff.entity';
import { MunicipalTariffEntity, NormEntity, SeasonalityFactorEntity, SocialNormEntity } from '../../tariff-and-norm/entities/base-tariff-and-norm.entity';
import { IndividualMeterEntity } from '../../meter/entities/individual-meter.entity';
import { GeneralMeterEntity } from '../../meter/entities/general-meter.entity';

@Entity('type_of_services')
export class TypeOfServiceEntity implements ITypeOfService {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    engName: string;

    @Column({ nullable: false })
    unitId: number;

    @OneToMany(() => CommonHouseNeedTariffEntity, (commonHouseNeedTariff) => commonHouseNeedTariff.typeOfService)
    commonHouseNeedTariffs: CommonHouseNeedTariffEntity[];

    @OneToMany(() => NormEntity, (norm) => norm.typeOfService)
    norms: NormEntity[];

    @OneToMany(() => MunicipalTariffEntity, (municipalTariff) => municipalTariff.typeOfService)
    municipalTariffs: MunicipalTariffEntity[];

    @OneToMany(() => SocialNormEntity, (socialNorm) => socialNorm.typeOfService)
    socialNorms: SocialNormEntity[];

    @OneToMany(() => SeasonalityFactorEntity, (seasonalityFactor) => seasonalityFactor.typeOfService)
    seasonalityFactors: SeasonalityFactorEntity[];

    @OneToMany(() => IndividualMeterEntity, (individualMeter) => individualMeter.typeOfService)
    individualMeters: IndividualMeterEntity[];

    @OneToMany(() => GeneralMeterEntity, (generalMeter) => generalMeter.typeOfService)
    generalMeters: GeneralMeterEntity[];

    constructor(data?: Partial<TypeOfServiceEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            id: this.id,
            name: this.name,
            engName: this.engName,
            unitId: this.unitId
        }
    }
}
