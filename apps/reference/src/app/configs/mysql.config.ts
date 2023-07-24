import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Houses } from '../subscriber/entities/house.entity';
import { Apartments } from '../subscriber/entities/apartment.entity';
import { Subscribers } from '../subscriber/entities/subscriber.entity';
import { GeneralMeters } from '../meter/entities/general-meter.entity';
import { IndividualMeters } from '../meter/entities/individual-meter.entity';
import { GeneralMeterReadings } from '../meter/entities/general-meter-reading.entity';
import { IndividualMeterReadings } from '../meter/entities/individual-meter-reading.entity';

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
      Houses, Apartments, Subscribers,
      GeneralMeters, IndividualMeters, GeneralMeterReadings, IndividualMeterReadings
    ],
  autoLoadEntities: true
});
