import { Module } from '@nestjs/common';
import { HouseController } from './controllers/house.controller';
import { HouseRepository } from './repositories/house-tariff.repository';
import { CommonHouseNeedTariffEntity } from './entities/house-tariff.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MunicipalTariffEntity, NormEntity, SeasonalityFactorsEntity, SocialNormsEntity } from './entities/base-tariff-and-norm.entity';
import { ApartmentRepository } from './repositories/base-tariff-and-norm.repository';
import { ApartmentController } from './controllers/apartment.controller';
import { SubscriberRepository } from './repositories/subscriber.repository';
import { SubscriberController } from './controllers/subscriber.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        NormEntity, MunicipalTariffEntity, SocialNormsEntity, SeasonalityFactorsEntity,
        CommonHouseNeedTariffEntity
      ]
    ),
  ],
  providers: [HouseRepository, ApartmentRepository, SubscriberRepository],
  exports: [HouseRepository, ApartmentRepository, SubscriberRepository],
  controllers: [HouseController, ApartmentController, SubscriberController],
})
export class SubscriberModule { }
