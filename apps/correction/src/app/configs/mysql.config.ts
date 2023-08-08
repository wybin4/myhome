import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DebtEntity } from '../debt/debt.entity';
import { PenaltyEntity } from '../penalty/entities/penalty.entity';
import { DepositEntity } from '../deposit/deposit.entity';
import { PenaltyRuleEntity } from '../penalty/entities/penalty-rule.entity';
import { PenaltyCalculationRuleEntity } from '../penalty/entities/penalty-calculation-rule.entity';

export const getMySQLConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: +configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USERNAME'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DATABASE'),
  synchronize: true,
  entities: [DebtEntity, DepositEntity, PenaltyEntity, PenaltyRuleEntity, PenaltyCalculationRuleEntity],
  autoLoadEntities: true
});
