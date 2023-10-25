import { Repository } from "typeorm";
import { TypeOfAppealEntity } from "./appeal.entity";
import { AppealType } from "@myhome/interfaces";

export async function seedTypeOfAppeal(typeOfAppealRepository: Repository<TypeOfAppealEntity>) {
    const data = [
        { name: AppealType.AddIndividualMeter },
        { name: AppealType.VerifyIndividualMeter },
        { name: AppealType.Claim },
        { name: AppealType.ProblemOrQuestion },
    ];

    for (const item of data) {
        const typeOfAppeal = typeOfAppealRepository.create(item);
        await typeOfAppealRepository.save(typeOfAppeal);
    }
}