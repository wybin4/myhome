export class AddHouseDto {
    city: string;
    street: string;
    houseNumber: string;
    livingArea!: number;
    noLivingArea!: number;
    commonArea!: number;
}

export class GetHousesByUserDto {
    isAllInfo!: boolean;
}