import { IAddHouse, IHouse } from '@myhome/interfaces';
import { ArrayMinSize, IsDefined, IsString, ValidateNested } from 'class-validator';
import { ValidateNestedArray } from '../../../array.validator';
import { ParseInt, ParseString } from '../../../parse.validator';

export namespace ReferenceAddHouses {
    export const topic = 'reference.add-houses.command';

    class HouseValidator {
        @IsString({ message: "Название города должно быть строкой" })
        city!: string;

        @IsString({ message: "Название улицы должно быть строкой" })
        street!: string;

        @ParseString({ message: "Номер дома должен быть строкой" })
        houseNumber!: string;

        @ParseInt({ message: "Жилая площадь должна быть числом" })
        livingArea!: number;

        @ParseInt({ message: "Нежилая площадь должна быть числом" })
        noLivingArea!: number;

        @ParseInt({ message: "Общедомовая площадь должна быть числом" })
        commonArea!: number;
    }

    export class Request {
        @IsDefined({ message: "Массив домов должен существовать" })
        @ArrayMinSize(1, { message: "Массив домов не должен быть пустым" })
        @ValidateNested({ each: true, always: true })
        @ValidateNestedArray(HouseValidator)
        houses!: IAddHouse[];

        @ParseInt({ message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        houses!: IHouse[];
    }
}
