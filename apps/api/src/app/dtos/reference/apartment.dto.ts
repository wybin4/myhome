export class AddApartmentDto {
    id?: number;
    houseId: number;
    apartmentNumber: number;
    totalArea: number;
    livingArea: number;
    numberOfRegistered: number;
}

export class GetApartmentsByUserDto {
    isAllInfo!: boolean;
}
