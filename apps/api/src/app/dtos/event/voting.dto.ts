export class AddVotingDto {
    houseId!: number;
    title!: string;
    createdAt!: string;
    expiredAt!: string;
    options!: string[];
}

export class UpdateVotingDto {
    optionId!: number;
}
