import { Repository } from "typeorm";
import { TypeOfServiceEntity } from "../entities/type-of-service.entity";

export async function seedTypeOfService(typeOfServiceRepository: Repository<TypeOfServiceEntity>) {
    const data = [
        { name: 'Отопление', unitId: 12, engName: 'Heat' },
        { name: 'ГВС', unitId: 12, engName: 'Water' },
        { name: 'ХВС', unitId: 10, engName: 'Water' },
        { name: 'Электроснабжение', unitId: 13, engName: 'Electricity' },
        { name: 'Газ', unitId: 10, engName: 'Gas' },
        { name: 'Отведение ГВ', unitId: 10, engName: 'Water' },
        { name: 'Отведение ХВ', unitId: 10, engName: 'Water' },
        { name: 'Вывоз и утил ТБО', unitId: 14, engName: '' },
        { name: 'СодОбщИмущ', unitId: 11, engName: '' },
        { name: 'Тех.обслуживание', unitId: 11, engName: '' },
        { name: 'Капремонт', unitId: 11, engName: '' },
    ];

    for (const item of data) {
        const typeOfService = typeOfServiceRepository.create(item);
        await typeOfServiceRepository.save(typeOfService);
    }
}