import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SinglePaymentDocumentEntity } from '../single-payment-document/single-payment-document.entity';

export const getMySQLConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: +configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USERNAME'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DATABASE'),
  synchronize: true,
  entities: [SinglePaymentDocumentEntity],
  autoLoadEntities: true
});
