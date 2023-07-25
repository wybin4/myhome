import { Module } from '@nestjs/common';
import { CommonHouseNeedTariffEntity } from './entities/house-tariff.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MunicipalTariffEntity, NormEntity, SeasonalityFactorEntity, SocialNormEntity } from './entities/base-tariff-and-norm.entity';
import { NormRepository, MunicipalTariffRepository, SocialNormRepository, SeasonalityFactorRepository, CommonHouseNeedTariffRepository } from './base-tariff-and-norm.repository';
import { TariffAndNormService } from './tariff-and-norm.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        NormEntity, MunicipalTariffEntity, SocialNormEntity, SeasonalityFactorEntity,
        CommonHouseNeedTariffEntity
      ]
    ),
  ],
  providers:
    [
      NormRepository, MunicipalTariffRepository, SocialNormRepository, SeasonalityFactorRepository,
      CommonHouseNeedTariffRepository,
      TariffAndNormService
    ],
  exports:
    [
      NormRepository, MunicipalTariffRepository, SocialNormRepository, SeasonalityFactorRepository,
      CommonHouseNeedTariffRepository
    ],
  controllers: [],
})
export class SubscriberModule { }
