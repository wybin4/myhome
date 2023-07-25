import { HttpStatus, Injectable } from "@nestjs/common";
import { CommonHouseNeedTariffRepository, IGenericTariffAndNormRepository, MunicipalTariffRepository, NormRepository, SeasonalityFactorRepository, SocialNormRepository } from "./base-tariff-and-norm.repository";
import { RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { NormEntity, SeasonalityFactorEntity, MunicipalTariffEntity, SocialNormEntity, BaseTariffAndNormEntity } from "./entities/base-tariff-and-norm.entity";
import { CommonHouseNeedTariffEntity } from "./entities/house-tariff.entity";
import { TariffAndNormType } from "@myhome/interfaces";


@Injectable()
export class TariffAndNormService {
    constructor(
        private readonly normRepository: NormRepository,
        private readonly seasonalityFactorRepository: SeasonalityFactorRepository,
        private readonly municipalTariffRepository: MunicipalTariffRepository,
        private readonly socialNormRepository: SocialNormRepository,
        private readonly commonHouseNeedTariffRepository: CommonHouseNeedTariffRepository,
    ) { }

    public async getTariffAndNorm(id: number, type: TariffAndNormType) {
        let tItem, gettedTN;
        switch (type) {
            case TariffAndNormType.Norm:
                return this.genericGetTariffAndNorm<NormEntity>
                    (
                        this.normRepository,
                        id, (item) => new NormEntity(item),
                        'Такая норма'
                    );
            case TariffAndNormType.SeasonalityFactor:
                return this.genericGetTariffAndNorm<SeasonalityFactorEntity>
                    (
                        this.seasonalityFactorRepository,
                        id,
                        (item) => new SeasonalityFactorEntity(item),
                        'Такой сезонный фактор'
                    );
            case TariffAndNormType.MunicipalTariff:
                return this.genericGetTariffAndNorm<MunicipalTariffEntity>
                    (
                        this.municipalTariffRepository,
                        id,
                        (item) => new MunicipalTariffEntity(item),
                        'Такой муниципальный тариф'
                    );
            case TariffAndNormType.SocialNorm:
                return this.genericGetTariffAndNorm<SocialNormEntity>
                    (
                        this.socialNormRepository,
                        id,
                        (item) => new SocialNormEntity(item),
                        'Такая социальная норма'
                    );
            case TariffAndNormType.CommonHouseNeedTariff:
                tItem = await this.commonHouseNeedTariffRepository.findById(id);
                if (!tItem) {
                    throw new RMQError('Такой тариф на общедомовые нужды не существует', ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedTN = new CommonHouseNeedTariffEntity(tItem).get();
                return { gettedTN };
            default:
                throw new RMQError('Такая сущность не существует', ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }


    private async genericGetTariffAndNorm<T extends BaseTariffAndNormEntity>(
        repository: IGenericTariffAndNormRepository<T>,
        id: number,
        createInstance: (item: T) => T,
        errorText: string,
    ): Promise<{ gettedTN: T }> {
        const tItem = await repository.findById(id);
        if (!tItem) {
            throw new RMQError(errorText + ' не существует', ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const gettedTN = createInstance(tItem);
        return { gettedTN };
    }


    // public async addTariffAndNorm(dto: ReferenceAddTariffOrNorm.Request) {
    // }
    // public async updateTariffAndNorm(dto: ReferenceUpdateTariffOrNorm.Request) {
    // }
}