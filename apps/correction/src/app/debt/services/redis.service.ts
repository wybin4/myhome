import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { getRedisConfig } from '../../configs/redis.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
    private readonly redisClient: Redis;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.redisClient = new Redis(getRedisConfig(this.configService));
    }

    async setValue(key: string, value: string): Promise<void> {
        await this.redisClient.set(key, value);
    }

    async getValue(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    async expireValue(key: string, time: number): Promise<number | null> {
        return await this.redisClient.expire(key, time);
    }
}
