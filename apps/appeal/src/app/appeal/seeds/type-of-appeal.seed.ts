import { Repository } from "typeorm";
import { TypeOfAppealEntity } from "../entities/appeal.entity";

export async function seedTypeOfAppeal(typeOfAppealRepository: Repository<TypeOfAppealEntity>) {
    const data = [
        { name: 'Замена счётчика' },
        { name: 'Поверка счётчика' },
        { name: 'Претензия' },
        { name: 'Проблема или вопрос' },
    ];

    for (const item of data) {
        const typeOfAppeal = typeOfAppealRepository.create(item);
        await typeOfAppealRepository.save(typeOfAppeal);
    }
}