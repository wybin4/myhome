import { ReferenceAddTariffOrNorm, ReferenceUpdateTariffOrNorm } from "@myhome/contracts";
import { TariffAndNormType } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";


@Injectable()
export class TariffAndNormService {
    public async getTariffAndNorm(id: number, type: TariffAndNormType) {
    }
    public async addTariffAndNorm(dto: ReferenceAddTariffOrNorm.Request) {
    }
    public async updateTariffAndNorm(dto: ReferenceUpdateTariffOrNorm.Request) {
    }
}