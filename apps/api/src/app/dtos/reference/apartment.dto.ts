import { IApartment } from "@myhome/interfaces";

export class AddApartmentsDto {
    apartments!: IApartment[];
}

export class GetApartmentsByUserDto {
    isAllInfo!: boolean;
}
