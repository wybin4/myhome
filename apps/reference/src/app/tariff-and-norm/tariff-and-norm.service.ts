import { HttpStatus, Injectable } from "@nestjs/common";
import { CommonHouseNeedTariffRepository, IGenericTariffAndNormRepository, MunicipalTariffRepository, NormRepository, SeasonalityFactorRepository, SocialNormRepository } from "./base-tariff-and-norm.repository";
import { RMQService } from "nestjs-rmq";
import { NormEntity, SeasonalityFactorEntity, MunicipalTariffEntity, SocialNormEntity, BaseTariffAndNormEntity } from "./entities/base-tariff-and-norm.entity";
import { CommonHouseNeedTariffEntity } from "./entities/house-tariff.entity";
import { ICommonHouseNeedTariff, IHouse, TariffAndNormType, UserRole } from "@myhome/interfaces";
import { ReferenceAddTariffOrNorm, ReferenceGetAllTariffs, ReferenceUpdateTariffOrNorm } from "@myhome/contracts";
import { HOUSE_NOT_EXIST, TYPE_OF_SERVICE_NOT_EXIST, UNIT_NOT_EXIST, INCORRECT_PARAM, INCORRECT_TARIFF_AND_NORM_TYPE, TARIFF_AND_NORM_NOT_EXIST, TARIFFS_NOT_EXIST, checkUser, RMQException } from "@myhome/constants";
import { TypeOfServiceRepository } from "../common/repositories/type-of-service.repository";
import { UnitRepository } from "../common/repositories/unit.repository";
import { HouseRepository } from "../subscriber/repositories/house.repository";
import { HouseEntity } from "../subscriber/entities/house.entity";


@Injectable()
export class TariffAndNormService {
    constructor(
        private readonly normRepository: NormRepository,
        private readonly seasonalityFactorRepository: SeasonalityFactorRepository,
        private readonly municipalTariffRepository: MunicipalTariffRepository,
        private readonly socialNormRepository: SocialNormRepository,
        private readonly commonHouseNeedTariffRepository: CommonHouseNeedTariffRepository,
        private readonly rmqService: RMQService,
        private readonly typeOfServiceRepository: TypeOfServiceRepository,
        private readonly unitRepository: UnitRepository,
        private readonly houseRepository: HouseRepository,
    ) { }

    public async getTariffAndNorm(id: number, type: TariffAndNormType) {
        let tItem: CommonHouseNeedTariffEntity, gettedTN: ICommonHouseNeedTariff;
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
                    throw new RMQException('Такой тариф на общедомовые нужды не существует', HttpStatus.NOT_FOUND);
                }
                gettedTN = new CommonHouseNeedTariffEntity(tItem).get();
                return { gettedTN };
            default:
                throw new RMQException('Такая сущность не существует', HttpStatus.CONFLICT);
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
            throw new RMQException(errorText + ' не существует', HttpStatus.NOT_FOUND);
        }
        const gettedTN = createInstance(tItem);
        return { gettedTN };
    }

    public async addTariffAndNorm(dto: ReferenceAddTariffOrNorm.Request) {
        const typeOfService = await this.typeOfServiceRepository.findById(dto.typeOfServiceId);
        if (!typeOfService) {
            throw new RMQException(TYPE_OF_SERVICE_NOT_EXIST.message(dto.typeOfServiceId), TYPE_OF_SERVICE_NOT_EXIST.status);
        }
        let house: HouseEntity;
        let newTEntity: CommonHouseNeedTariffEntity, newT: ICommonHouseNeedTariff;
        switch (dto.type) {
            case TariffAndNormType.Norm:
                await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
                await this.checkUnit(dto.unitId);
                if (!dto.norm) {
                    throw new RMQException(INCORRECT_PARAM + 'norm', HttpStatus.BAD_REQUEST);
                }
                if (!dto.typeOfNorm) {
                    throw new RMQException(INCORRECT_PARAM + 'typeOfNorm', HttpStatus.BAD_REQUEST);
                }
                return this.genericAddTariffAndNorm<NormEntity>(
                    this.normRepository,
                    dto, NormEntity
                )
            case TariffAndNormType.SeasonalityFactor:
                await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
                if (!dto.monthName) {
                    throw new RMQException(INCORRECT_PARAM + 'monthName', HttpStatus.BAD_REQUEST);
                }
                if (!dto.coefficient) {
                    throw new RMQException(INCORRECT_PARAM + 'coefficient', HttpStatus.BAD_REQUEST);
                }
                return this.genericAddTariffAndNorm<SeasonalityFactorEntity>(
                    this.seasonalityFactorRepository,
                    dto, SeasonalityFactorEntity
                )
            case TariffAndNormType.MunicipalTariff:
                await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
                await this.checkUnit(dto.unitId);
                if (!dto.norm) {
                    throw new RMQException(INCORRECT_PARAM + 'norm', HttpStatus.BAD_REQUEST);
                }
                if (!dto.supernorm) {
                    throw new RMQException(INCORRECT_PARAM + 'supernorm', HttpStatus.BAD_REQUEST);
                }
                return this.genericAddTariffAndNorm<MunicipalTariffEntity>(
                    this.municipalTariffRepository,
                    dto, MunicipalTariffEntity
                )
            case TariffAndNormType.SocialNorm:
                await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
                await this.checkUnit(dto.unitId);
                if (!dto.norm) {
                    throw new RMQException(INCORRECT_PARAM + 'norm', HttpStatus.BAD_REQUEST);
                }
                if (!dto.amount) {
                    throw new RMQException(INCORRECT_PARAM + 'amount', HttpStatus.BAD_REQUEST);
                }
                return this.genericAddTariffAndNorm<SocialNormEntity>(
                    this.socialNormRepository,
                    dto, SocialNormEntity
                )
            case TariffAndNormType.CommonHouseNeedTariff:
                house = await this.houseRepository.findById(dto.houseId);
                if (!house) {
                    throw new RMQException(HOUSE_NOT_EXIST.message(dto.houseId), HOUSE_NOT_EXIST.status);
                }
                await this.checkUnit(dto.unitId);
                if (!dto.multiplier) {
                    throw new RMQException(INCORRECT_PARAM + 'multiplier', HttpStatus.BAD_REQUEST);
                }
                newTEntity = new CommonHouseNeedTariffEntity(dto);
                newT = await this.commonHouseNeedTariffRepository.create(newTEntity);
                return { newT };
            default:
                throw new RMQException(INCORRECT_TARIFF_AND_NORM_TYPE, HttpStatus.CONFLICT);
        }

    }

    private async checkUnit(unitId: number) {
        const unit = await this.unitRepository.findUnitById(unitId);
        if (!unit) {
            throw new RMQException(UNIT_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
        return;
    }

    private async genericAddTariffAndNorm<T extends BaseTariffAndNormEntity>(
        repository: IGenericTariffAndNormRepository<T>,
        dto: ReferenceAddTariffOrNorm.Request,
        createInstance: new (dto: ReferenceAddTariffOrNorm.Request) => T,
    ) {
        const newTEntity = new createInstance(dto);
        const newT = await repository.create(newTEntity);
        return { newT };
    }

    public async updateTariffAndNorm(dto: ReferenceUpdateTariffOrNorm.Request) {
        let existedT: CommonHouseNeedTariffEntity, tEntity: Promise<CommonHouseNeedTariffEntity>;

        switch (dto.type) {
            case TariffAndNormType.Norm:
                if (!dto.norm) {
                    throw new RMQException(INCORRECT_PARAM + 'norm', HttpStatus.BAD_REQUEST);
                }
                return this.genericUpdateTariffAndNorm<NormEntity>(
                    this.normRepository,
                    dto, (item) => new NormEntity(item),
                )
            case TariffAndNormType.SeasonalityFactor:
                if (!dto.monthName) {
                    throw new RMQException(INCORRECT_PARAM + 'monthName', HttpStatus.BAD_REQUEST);
                }
                if (!dto.coefficient) {
                    throw new RMQException(INCORRECT_PARAM + 'coefficient', HttpStatus.BAD_REQUEST);
                }
                return this.genericUpdateTariffAndNorm<SeasonalityFactorEntity>(
                    this.seasonalityFactorRepository,
                    dto, (item) => new SeasonalityFactorEntity(item),
                )
            case TariffAndNormType.MunicipalTariff:
                if (!dto.norm) {
                    throw new RMQException(INCORRECT_PARAM + 'norm', HttpStatus.BAD_REQUEST);
                }
                if (!dto.supernorm) {
                    throw new RMQException(INCORRECT_PARAM + 'supernorm', HttpStatus.BAD_REQUEST);
                }
                return this.genericUpdateTariffAndNorm<MunicipalTariffEntity>(
                    this.municipalTariffRepository,
                    dto, (item) => new MunicipalTariffEntity(item),
                )
            case TariffAndNormType.SocialNorm:
                if (!dto.norm) {
                    throw new RMQException(INCORRECT_PARAM + 'norm', HttpStatus.BAD_REQUEST);
                }
                if (!dto.amount) {
                    throw new RMQException(INCORRECT_PARAM + 'amount', HttpStatus.BAD_REQUEST);
                }
                return this.genericUpdateTariffAndNorm<SocialNormEntity>(
                    this.socialNormRepository,
                    dto, (item) => new SocialNormEntity(item),
                )
            case TariffAndNormType.CommonHouseNeedTariff:
                if (!dto.multiplier) {
                    throw new RMQException(INCORRECT_PARAM + 'multiplier', HttpStatus.BAD_REQUEST);
                }
                existedT = await this.commonHouseNeedTariffRepository.findById(dto.id);
                if (!existedT) {
                    throw new RMQException(TARIFF_AND_NORM_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                tEntity = new CommonHouseNeedTariffEntity(existedT).update(dto.multiplier);
                return Promise.all([
                    this.commonHouseNeedTariffRepository.update(await tEntity),
                ]);
            default:
                throw new RMQException(INCORRECT_TARIFF_AND_NORM_TYPE, HttpStatus.CONFLICT);
        }
    }

    private async genericUpdateTariffAndNorm<T extends BaseTariffAndNormEntity>(
        repository: IGenericTariffAndNormRepository<T>,
        dto: ReferenceUpdateTariffOrNorm.Request,
        createInstance: (item: T) => T,
    ) {
        const existedT = await repository.findById(dto.id);
        if (!existedT) {
            throw new RMQException(TARIFF_AND_NORM_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
        const tEntity = createInstance(existedT).update(dto);
        return Promise.all([
            repository.update(await tEntity),
        ]);
    }

    public async getAllTariffs(dto: ReferenceGetAllTariffs.Request) {
        let house: IHouse;
        switch (dto.type) {
            case TariffAndNormType.MunicipalTariff:
                await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
                try {
                    return await this.municipalTariffRepository.findAllByManagementCID(dto.managementCompanyId);
                } catch (e) {
                    throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
            case TariffAndNormType.CommonHouseNeedTariff:
                house = await this.houseRepository.findById(dto.houseId);
                if (!house) {
                    throw new RMQException(HOUSE_NOT_EXIST.message(dto.houseId), HOUSE_NOT_EXIST.status);
                }
                try {
                    return await this.commonHouseNeedTariffRepository.findAllByHouseID(dto.houseId);
                } catch (e) {
                    throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
            default:
                throw new RMQException(INCORRECT_TARIFF_AND_NORM_TYPE, HttpStatus.CONFLICT);
        }
    }
}