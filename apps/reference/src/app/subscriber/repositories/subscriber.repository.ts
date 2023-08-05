import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

    async findSubscriberIdsByApartmentIds(apartmentIds: number[]): Promise<number[]> {
        const subscribers = await this.subscriberRepository.find({
            where: {
                apartmentId: In(apartmentIds),
            },
            select: ['id'],
        });

        return subscribers.map(subscriber => subscriber.id);
    }

    async findSubscribers(subscriberIds: number[]) {
        return this.subscriberRepository.find({
            where: {
                id: In(subscriberIds),
            }
        });
    }
}
