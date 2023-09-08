import { Repository } from "typeorm";
import { TypeOfServiceEntity } from "../entities/type-of-service.entity";

export async function seedTypeOfService(typeOfServiceRepository: Repository<TypeOfServiceEntity>) {
    const data = [
        { name: 'Отопление', unitId: 12 },
        { name: 'ГВС', unitId: 12 },
        { name: 'ХВС', unitId: 10 },
        { name: 'Электроснабжение', unitId: 13 },
        { name: 'Газ', unitId: 10 },
        { name: 'Отведение ГВ', unitId: 10 },
        { name: 'Отведение ХВ', unitId: 10 },
        { name: 'Вывоз и утил ТБО', unitId: 14 },
        { name: 'СодОбщИмущ', unitId: 11},
        { name: 'Тех.обслуживание', unitId: 11 },
        { name: 'Капремонт', unitId: 11 },
    ];

    for (const item of data) {
        const typeOfService = typeOfServiceRepository.create(item);
        await typeOfServiceRepository.save(typeOfService);
    }
}