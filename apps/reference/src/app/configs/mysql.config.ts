import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HouseEnitity } from '../subscriber/entities/house.entity';
import { ApartmentEnitity } from '../subscriber/entities/apartment.entity';
import { SubscriberEnitity } from '../subscriber/entities/subscriber.entity';
import { GeneralMeterEnitity } from '../meter/entities/general-meter.entity';
import { IndividualMeterEnitity } from '../meter/entities/individual-meter.entity';
import { GeneralMeterReadingEnitity } from '../meter/entities/general-meter-reading.entity';
import { IndividualMeterReadingEnitity } from '../meter/entities/individual-meter-reading.entity';
import { UnitEnitity } from '../common/entities/unit.entity';
import { TypeOfServiceEnitity } from '../common/entities/type-of-service.entity';

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
      HouseEnitity, ApartmentEnitity, SubscriberEnitity,
      GeneralMeterEnitity, IndividualMeterEnitity, GeneralMeterReadingEnitity, IndividualMeterReadingEnitity,
      UnitEnitity, TypeOfServiceEnitity
    ],
  autoLoadEntities: true
});
