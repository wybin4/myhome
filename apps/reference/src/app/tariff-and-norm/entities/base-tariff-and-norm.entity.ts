import { GenericEnumTransformer } from '@myhome/constants';
import { ReferenceUpdateTariffOrNorm } from '@myhome/contracts';
import { IBaseTariffAndNorm, IMunicipalTariff, INorm, ISeasonalityFactor, ISocialNorm, TypeOfNorm } from '@myhome/interfaces';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TypeOfServiceEntity } from '../../common/entities/type-of-service.entity';
import { UnitEntity } from '../../common/entities/unit.entity';

export class BaseTariffAndNormEntity implements IBaseTariffAndNorm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  managementCompanyId: number;

  @Column({ nullable: false })
  typeOfServiceId: number;

  constructor(data?: Partial<BaseTariffAndNormEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  public get() {
    return {
      managementCompanyId: this.managementCompanyId,
      typeOfServiceId: this.typeOfServiceId,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async update(object: ReferenceUpdateTariffOrNorm.Request) {
    return this;
  }
}

@Entity('norms')
export class NormEntity extends BaseTariffAndNormEntity implements INorm {
  @Column({ nullable: false })
  unitId: number;

  @Column('double', { nullable: false })
  norm: number;

  @ManyToOne(() => TypeOfServiceEntity, (typeOfService) => typeOfService.norms)
  typeOfService: TypeOfServiceEntity;

  @ManyToOne(() => UnitEntity, (unit) => unit.norms)
  unit: UnitEntity;

  @Column({
    nullable: false,
    type: 'varchar',
    transformer: GenericEnumTransformer(TypeOfNorm),
    default: TypeOfNorm.Individual,
  })
  typeOfNorm: TypeOfNorm;

  public get() {
    return {
      managementCompanyId: this.managementCompanyId,
      typeOfServiceId: this.typeOfServiceId,
      unitId: this.unitId,
      norm: this.norm,
      typeOfNorm: this.typeOfNorm
    }
  }

  public async update(object: ReferenceUpdateTariffOrNorm.Request) {
    this.norm = object.norm;
    return this;
  }
}

@Entity('municipal_tariffs')
export class MunicipalTariffEntity extends BaseTariffAndNormEntity implements IMunicipalTariff {
  @Column({ nullable: false })
  unitId: number;

  @Column('double', { nullable: false })
  norm: number;

  @Column('double', { nullable: true })
  supernorm: number;

  @Column('double', { nullable: true })
  multiplyingFactor: number;

  @ManyToOne(() => TypeOfServiceEntity, (typeOfService) => typeOfService.municipalTariffs)
  typeOfService: TypeOfServiceEntity;

  @ManyToOne(() => UnitEntity, (unit) => unit.municipalTariffs)
  unit: UnitEntity;

  public get() {
    return {
      managementCompanyId: this.managementCompanyId,
      typeOfServiceId: this.typeOfServiceId,
      unitId: this.unitId,
      norm: this.norm,
      supernorm: this.supernorm,
    }
  }

  public async update(object: ReferenceUpdateTariffOrNorm.Request) {
    if (object.norm !== undefined) {
      this.norm = object.norm;
    }
    if (object.supernorm !== undefined) {
      this.supernorm = object.supernorm;
    } return this;
  }

}

@Entity('social_norms')
export class SocialNormEntity extends BaseTariffAndNormEntity implements ISocialNorm {
  @Column({ nullable: false })
  unitId: number;

  @Column('double', { nullable: false })
  norm: number;

  @Column({ nullable: false })
  amount: number;

  @ManyToOne(() => TypeOfServiceEntity, (typeOfService) => typeOfService.socialNorms)
  typeOfService: TypeOfServiceEntity;

  @ManyToOne(() => UnitEntity, (unit) => unit.socialNorms)
  unit: UnitEntity;

  public get() {
    return {
      managementCompanyId: this.managementCompanyId,
      typeOfServiceId: this.typeOfServiceId,
      unitId: this.unitId,
      norm: this.norm,
      amount: this.amount,
    }
  }

  public async update(object: ReferenceUpdateTariffOrNorm.Request) {
    if (object.norm !== undefined) {
      this.norm = object.norm;
    }
    if (object.amount !== undefined) {
      this.amount = object.amount;
    } return this;
  }
}

@Entity('seasonality_factors')
export class SeasonalityFactorEntity extends BaseTariffAndNormEntity implements ISeasonalityFactor {
  @Column({ nullable: false })
  monthName: string;

  @Column('double', { nullable: false })
  coefficient: number;

  @ManyToOne(() => TypeOfServiceEntity, (typeOfService) => typeOfService.seasonalityFactors)
  typeOfService: TypeOfServiceEntity;

  public get() {
    return {
      managementCompanyId: this.managementCompanyId,
      typeOfServiceId: this.typeOfServiceId,
      monthName: this.monthName,
      coefficient: this.coefficient,
    }
  }
  public async update(object: ReferenceUpdateTariffOrNorm.Request) {
    this.coefficient = object.coefficient;
    return this;
  }
}