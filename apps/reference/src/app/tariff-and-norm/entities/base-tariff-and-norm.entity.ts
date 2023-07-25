import { IBaseTariffAndNorm } from '@myhome/interfaces';
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
}

@Entity('norms')
export class NormEntity extends BaseTariffAndNormEntity {
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

  public async update(norm: number) {
    this.norm = norm;
    return this;
  }
}

@Entity('municipal_tariffs')
export class MunicipalTariffEntity extends BaseTariffAndNormEntity {
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

  public async update(norm?: number, supernorm?: number) {
    if (norm !== undefined) {
      this.norm = norm;
    }
    if (supernorm !== undefined) {
      this.supernorm = supernorm;
    } return this;
  }

}

@Entity('social_norms')
export class SocialNormEntity extends BaseTariffAndNormEntity {
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

  public async update(norm?: number, amount?: number) {
    if (norm !== undefined) {
      this.norm = norm;
    }
    if (amount !== undefined) {
      this.amount = amount;
    } return this;
  }
}

@Entity('seasonality_factors')
export class SeasonalityFactorEntity extends BaseTariffAndNormEntity {
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
  public async update(coefficient: number) {
    this.coefficient = coefficient;
    return this;
  }
}