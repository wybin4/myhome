import { IUnit } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CommonHouseNeedTariffEntity } from '../../tariff-and-norm/entities/house-tariff.entity';
import { MunicipalTariffEntity, NormEntity, SocialNormEntity } from '../../tariff-and-norm/entities/base-tariff-and-norm.entity';

@Entity('units')
export class UnitEntity implements IUnit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @OneToMany(() => CommonHouseNeedTariffEntity, (commonHouseNeedTariff) => commonHouseNeedTariff.unit)
    commonHouseNeedTariffs: CommonHouseNeedTariffEntity[];

    @OneToMany(() => NormEntity, (norm) => norm.unit)
    norms: NormEntity[];

    @OneToMany(() => MunicipalTariffEntity, (municipalTariff) => municipalTariff.unit)
    municipalTariffs: MunicipalTariffEntity[];

    @OneToMany(() => SocialNormEntity, (socialNorm) => socialNorm.unit)
    socialNorms: SocialNormEntity[];

    constructor(data?: Partial<UnitEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get(): IUnit {
        return {
            name: this.name
        }
    }

    public getWithId() {
        return {
            id: this.id,
            name: this.name
        }
    }
}
