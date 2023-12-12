import { IAddHouse } from "@myhome/interfaces";
import { GetMetaDto } from "../meta.dto";

export class AddHousesDto {
    houses: IAddHouse[];
}

export class GetHousesByUserDto extends GetMetaDto {
    isAllInfo!: boolean;
}