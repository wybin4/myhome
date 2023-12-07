import { IAddHouse, IMeta } from "@myhome/interfaces";

export class AddHousesDto {
    houses: IAddHouse[];
}

export class GetHousesByUserDto {
    isAllInfo!: boolean;
    meta?: IMeta;
}