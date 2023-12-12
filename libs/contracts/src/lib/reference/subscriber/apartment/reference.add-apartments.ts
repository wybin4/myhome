import { ArrayMinSize, IsDefined } from 'class-validator';
import { IGetApartment } from './reference.get-apartments-by-user';
import { ValidateNestedArray } from '../../../array.validator';
import { IApartment } from '@myhome/interfaces';
import { ParseInt } from '../../../parse.validator';

export namespace ReferenceAddApartments {
    export const topic = 'reference.add-apartments.command';

    class ApartmentValidator {
        @ParseInt({ message: "Id дома должен быть числом" })
        houseId!: number;

        @ParseInt({ message: "Номер квартиры должен быть числом" })
        apartmentNumber!: number;

        @ParseInt({ message: "Общая площадь квартиры должна быть числом" })
        totalArea!: number;

        @ParseInt({ message: "Жилая площадь квартиры быть числом" })
        livingArea!: number;

        @ParseInt({ message: "Количество зарегистрированных должно быть числом" })
        numberOfRegistered!: number;
    }

    export class Request {
        @IsDefined({ message: "Массив квартир должен существовать" })
        @ArrayMinSize(1, { message: "Массив квартир не должен быть пустым" })
        @ValidateNestedArray(ApartmentValidator)
        apartments!: IApartment[];
    }

    export class Response {
        apartments!: IGetApartment[];
    }
}
