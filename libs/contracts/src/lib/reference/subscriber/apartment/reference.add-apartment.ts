import { IsNumber } from 'class-validator';
import { IGetApartment } from './reference.get-apartments-by-user';

export namespace ReferenceAddApartment {
    export const topic = 'reference.add-apartment.command';

    export class Request {
        @IsNumber({}, { message: "Id дома должен быть числом" })
        houseId!: number;

        @IsNumber({}, { message: "Номер квартиры должен быть числом" })
        apartmentNumber!: number;

        @IsNumber({}, { message: "Общая площадь квартиры должна быть числом" })
        totalArea!: number;

        @IsNumber({}, { message: "Жилая площадь квартиры быть числом" })
        livingArea!: number;

        @IsNumber({}, { message: "Количество зарегистрированных должно быть числом" })
        numberOfRegistered!: number;
    }

    export class Response {
        apartment!: IGetApartment;
    }
}
