import { Module } from '@nestjs/common';
import { CommonHouseNeedTariffEntity } from './entities/house-tariff.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MunicipalTariffEntity, NormEntity, SeasonalityFactorEntity, SocialNormEntity } from './entities/base-tariff-and-norm.entity';
import { NormRepository, MunicipalTariffRepository, SocialNormRepository, SeasonalityFactorRepository } from './repositories/base-tariff-and-norm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        NormEntity, MunicipalTariffEntity, SocialNormEntity, SeasonalityFactorEntity,
        CommonHouseNeedTariffEntity
      ]
    ),
  ],
  providers: [NormRepository, MunicipalTariffRepository, SocialNormRepository, SeasonalityFactorRepository],
  exports: [NormRepository, MunicipalTariffRepository, SocialNormRepository, SeasonalityFactorRepository],
  controllers: [],
})
export class SubscriberModule { }
