export class AddVotingDto {
    houseId!: number;
    title!: string;
    expiredAt!: string;
    options!: string[];
}

export class UpdateVotingDto {
    optionId!: number;
}
