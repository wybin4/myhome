import { Repository } from "typeorm";
import { TypeOfServiceEntity } from "../entities/type-of-service.entity";

export async function seedTypeOfService(typeOfServiceRepository: Repository<TypeOfServiceEntity>) {
    const data = [
        { name: 'Отопление' },
        { name: 'ГВС' },
        { name: 'ХВС' },
        { name: 'Электроснабжение' },
        { name: 'Газ' },
        { name: 'Отведение ГВ' },
        { name: 'Отведение ХВ' },
        { name: 'Вывоз и утил ТБО' },
        { name: 'СодОбщИмущ' },
        { name: 'Тех.обслуживание' },
        { name: 'Капремонт' },
    ];

    for (const item of data) {
        const typeOfService = typeOfServiceRepository.create(item);
        await typeOfServiceRepository.save(typeOfService);
    }
}