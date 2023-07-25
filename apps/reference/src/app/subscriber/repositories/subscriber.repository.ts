import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriberEnitity } from '../entities/subscriber.entity';

@Injectable()
export class SubscriberRepository {
    constructor(
        @InjectRepository(SubscriberEnitity)
        private readonly subscriberRepository: Repository<SubscriberEnitity>,
    ) { }

    async createSubscriber(subscriber: SubscriberEnitity) {
        return this.subscriberRepository.save(subscriber);
    }

    async findSubscriberById(id: number) {
        return this.subscriberRepository.findOne({ where: { id } });
    }

    async findSubscriberByPersonalAccount(personalAccount: string) {
        return this.subscriberRepository.findOne({ where: { personalAccount } });
    }

    async deleteSubscriber(id: number): Promise<void> {
        await this.subscriberRepository.delete({ id });
    }

    async updateSubscriber(subscriber: SubscriberEnitity) {
        await this.subscriberRepository.update(subscriber.id, subscriber);
        return this.findSubscriberById(subscriber.id);
    }
}
