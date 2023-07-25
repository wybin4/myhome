import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriberEntity } from '../entities/subscriber.entity';

@Injectable()
export class SubscriberRepository {
    constructor(
        @InjectRepository(SubscriberEntity)
        private readonly subscriberRepository: Repository<SubscriberEntity>,
    ) { }

    async createSubscriber(subscriber: SubscriberEntity) {
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

    async updateSubscriber(subscriber: SubscriberEntity) {
        await this.subscriberRepository.update(subscriber.id, subscriber);
        return this.findSubscriberById(subscriber.id);
    }
}
