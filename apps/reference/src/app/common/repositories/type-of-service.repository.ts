import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { TypeOfServiceEnitity } from '../entities/units.entity';
import { MeterStatus } from '@myhome/interfaces';

@Injectable()
export class TypeOfServiceRepository {
    constructor(
        @InjectRepository(TypeOfServiceEnitity)
        private readonly typeOfServiceRepository: Repository<TypeOfServiceEnitity>,
    ) { }

    async createTypeOfService(typeOfService: TypeOfServiceEnitity) {
        return this.typeOfServiceRepository.save(typeOfService);
    }

    async findTypeOfServiceById(id: number) {
        return this.typeOfServiceRepository.findOne({ where: { id } });
    }

    async findIndividualMeterByFNumber(factoryNumber: string) {
        return this.typeOfServiceRepository.findOne({ where: { factoryNumber } });
    }

    async updateTypeOfService(meter: TypeOfServiceEnitity) {
        await this.typeOfServiceRepository.update(meter.id, meter);
        return this.findTypeOfServiceById(meter.id);
    }

    async findExpiredTypeOfServices(): Promise<TypeOfServiceEnitity[]> {
        const currentDate = new Date();
        return this.typeOfServiceRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }

    async saveTypeOfServices(meters: TypeOfServiceEnitity[]): Promise<TypeOfServiceEnitity[]> {
        return this.typeOfServiceRepository.save(meters);
    }
}
