import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HouseEntity } from '../subscriber/entities/house.entity';
import { ApartmentEntity } from '../subscriber/entities/apartment.entity';
import { SubscriberEntity } from '../subscriber/entities/subscriber.entity';
import { GeneralMeterEntity } from '../meter/entities/general-meter.entity';
import { IndividualMeterEntity } from '../meter/entities/individual-meter.entity';
import { GeneralMeterReadingEntity } from '../meter/entities/general-meter-reading.entity';
import { IndividualMeterReadingEntity } from '../meter/entities/individual-meter-reading.entity';
import { UnitEntity } from '../common/entities/unit.entity';
import { TypeOfServiceEntity } from '../common/entities/type-of-service.entity';
import { NormEntity, MunicipalTariffEntity, SocialNormsEntity, SeasonalityFactorsEntity } from '../tariff-and-norm/entities/base-tariff-and-norm.entity';
import { CommonHouseNeedTariffEntity } from '../tariff-and-norm/entities/house-tariff.entity';

export const getMySQLConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: +configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USERNAME'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DATABASE'),
  synchronize: true,
  entities:
    [
      HouseEntity, ApartmentEntity, SubscriberEntity,
      GeneralMeterEntity, IndividualMeterEntity, GeneralMeterReadingEntity, IndividualMeterReadingEntity,
      UnitEntity, TypeOfServiceEntity,
      NormEntity, MunicipalTariffEntity, SocialNormsEntity, SeasonalityFactorsEntity,
      CommonHouseNeedTariffEntity
    ],
  autoLoadEntities: true
});
