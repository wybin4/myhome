import { IApartment, IMeta } from "@myhome/interfaces";

export class AddApartmentsDto {
    apartments!: IApartment[];
}

export class GetApartmentsByUserDto {
    isAllInfo!: boolean;
    meta?: IMeta;
}
