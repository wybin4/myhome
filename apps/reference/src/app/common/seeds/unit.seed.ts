import { Repository } from "typeorm";
import { UnitEntity } from "../entities/unit.entity";

export async function seedUnit(unitRepository: Repository<UnitEntity>) {
    const data = [
        { name: 'руб./гКал' },
        { name: 'руб./м3' },
        { name: 'руб./кВтч' },
        { name: 'руб./чел' },
        { name: 'руб./м2' },
        { name: 'м3/чел' },
        { name: 'м3/м2' },
        { name: 'гКал/м2' },
        { name: 'кВтч/чел' },
        { name: 'м3' },
        { name: 'м2' },
        { name: 'гКал' },
        { name: 'кВтч' },
        { name: 'чел' },
    ];

    for (const item of data) {
        const unit = unitRepository.create(item);
        await unitRepository.save(unit);
    }
}