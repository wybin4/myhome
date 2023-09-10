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

    async create(subscriber: SubscriberEntity) {
        return this.subscriberRepository.save(subscriber);
    }

    async findById(id: number) {
        return this.subscriberRepository.findOne({ where: { id } });
    }

    async findByPersonalAccount(personalAccount: string) {
        return this.subscriberRepository.findOne({ where: { personalAccount } });
    }

    async update(subscriber: SubscriberEntity) {
        await this.subscriberRepository.update(subscriber.id, subscriber);
        return this.findById(subscriber.id);
    }

    async findIdsByApartmentIds(apartmentIds: number[]): Promise<number[]> {
        const subscribers = await this.subscriberRepository.find({
            where: {
                apartmentId: In(apartmentIds),
            },
            select: ['id'],
        });

        return subscribers.map(subscriber => subscriber.id);
    }

    async findMany(subscriberIds: number[]) {
        return this.subscriberRepository.find({
            where: {
                id: In(subscriberIds),
            }
        });
    }
}
