import { ICommonHouseNeedTariff } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TypeOfServiceEntity } from '../../common/entities/type-of-service.entity';
import { UnitEntity } from '../../common/entities/unit.entity';

@Entity('common_house_need_tariffs')
export class CommonHouseNeedTariffEntity implements ICommonHouseNeedTariff {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    houseId: number;

    @Column({ nullable: false })
    typeOfServiceId: number;

    @Column({ nullable: false })
    unitId: number;

    @Column('double', { nullable: false })
    multiplier: number;

    @ManyToOne(() => TypeOfServiceEntity, (typeOfService) => typeOfService.commonHouseNeedTariffs)
    typeOfService: TypeOfServiceEntity;

    @ManyToOne(() => UnitEntity, (unit) => unit.commonHouseNeedTariffs)
    unit: UnitEntity;

    constructor(data?: Partial<CommonHouseNeedTariffEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public async update(multiplier: number) {
        this.multiplier = multiplier;
        return this;
    }

    public get() {
        return {
            houseId: this.houseId,
            typeOfServiceId: this.typeOfServiceId,
            unitId: this.unitId,
            multiplier: this.multiplier,
        }
    }
}
