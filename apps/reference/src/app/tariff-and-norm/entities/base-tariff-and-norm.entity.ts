import { ReferenceUpdateTariffOrNorm } from '@myhome/contracts';
import { IBaseTariffAndNorm, IMunicipalTariff, INorm, ISeasonalityFactor, ISocialNorm } from '@myhome/interfaces';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ nullable: false })
  norm: number;

  public get() {
    return {
      managementCompanyId: this.managementCompanyId,
      typeOfServiceId: this.typeOfServiceId,
      unitId: this.unitId,
      norm: this.norm,
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

  @Column({ nullable: false })
  norm: number;

  @Column({ nullable: true })
  supernorm: number;

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

  @Column({ nullable: false })
  norm: number;

  @Column({ nullable: false })
  amount: number;

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

  @Column({ nullable: false })
  coefficient: number;

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