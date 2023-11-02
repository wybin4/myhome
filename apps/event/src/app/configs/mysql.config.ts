import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HouseNotificationEntity } from '../notification/entities/house-notification.entity';
import { ServiceNotificationEntity } from '../notification/entities/service-notification.entity';
import { VoteEntity } from '../voting/entities/vote.entity';
import { VotingEntity } from '../voting/entities/voting.entity';
import { OptionEntity } from '../voting/entities/option.entity';
import { AppealEntity } from '../appeal/appeal.entity';

export const getMySQLConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: +configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USERNAME'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DATABASE'),
  synchronize: true,
  entities: [
    HouseNotificationEntity, ServiceNotificationEntity,
    VotingEntity, OptionEntity, VoteEntity,
    AppealEntity
  ],
  autoLoadEntities: true
});
