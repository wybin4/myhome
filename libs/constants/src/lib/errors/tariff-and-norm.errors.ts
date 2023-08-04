import { HttpStatus } from "@nestjs/common";

export const INCORRECT_PARAM = 'Пропущен требуемый параметр: ';
export const INCORRECT_TARIFF_AND_NORM_TYPE = 'Некорректный тип';
export const TARIFF_AND_NORM_NOT_EXIST = 'Сущность с таким id не существует';
export const TARIFFS_NOT_EXIST = 'Невозможно получить такие тарифы';
export const NORM_NOT_EXIST = {
    message: 'Такая норма не существует',
    status: HttpStatus.NOT_FOUND,
};

export const NORMS_NOT_EXIST = {
    message: 'Невозможно получить такие нормы',
    status: HttpStatus.NOT_FOUND,
};
