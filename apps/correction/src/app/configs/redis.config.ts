import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const getRedisConfig = (configService: ConfigService): RedisOptions => ({
    host: configService.get("REDIS_HOST"),
    port: configService.get("REDIS_PORT"),
});
