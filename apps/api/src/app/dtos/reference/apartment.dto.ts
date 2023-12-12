import { IApartment } from "@myhome/interfaces";
import { GetMetaDto } from "../meta.dto";

export class AddApartmentsDto {
    apartments!: IApartment[];
}

export class GetApartmentsByUserDto extends GetMetaDto {
    isAllInfo!: boolean;
}
