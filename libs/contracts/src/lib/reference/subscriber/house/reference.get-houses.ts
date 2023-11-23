import { IsArray, IsBoolean } from 'class-validator';
import { IHouse } from '@myhome/interfaces';

export namespace ReferenceGetHouses {
    export const topic = 'reference.get-houses.query';

    export class Request {
        @IsArray({ message: "Id домов должны быть массивом чисел" })
        houseIds!: number[];

        @IsBoolean({ message: "Флаг должен быть правдой или ложью" })
        isAllInfo!: boolean;
    }

    export class Response {
        houses!: IHouse[] | IGetHouseAllInfo[];
    }
}

export interface IGetHouseAllInfo extends IHouse {
    ownerIds: number[];
    managementCompanyName: string;
}
