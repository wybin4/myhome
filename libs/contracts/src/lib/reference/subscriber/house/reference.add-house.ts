import { IHouse } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace ReferenceAddHouse {
    export const topic = 'reference.add-house.command';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @IsString({ message: "Название города должно быть строкой" })
        city!: string;

        @IsString({ message: "Название улицы должно быть строкой" })
        street!: string;

        @IsString({ message: "Номер дома должен быть строкой" })
        houseNumber!: string;

        @IsNumber({}, { message: "Жилая площадь должна быть числом" })
        livingArea!: number;

        @IsNumber({}, { message: "Нежилая площадь должна быть числом" })
        noLivingArea!: number;

        @IsNumber({}, { message: "Общедомовая площадь должна быть числом" })
        commonArea!: number;
    }

    export class Response {
        house!: IHouse;
    }
}
