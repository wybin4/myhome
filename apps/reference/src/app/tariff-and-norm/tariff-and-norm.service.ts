import { HttpStatus, Injectable } from "@nestjs/common";
import { CommonHouseNeedTariffRepository, IGenericTariffAndNormRepository, MunicipalTariffRepository, NormRepository, SeasonalityFactorRepository, SocialNormRepository } from "./base-tariff-and-norm.repository";
import { RMQService } from "nestjs-rmq";
import { NormEntity, SeasonalityFactorEntity, MunicipalTariffEntity, SocialNormEntity, BaseTariffAndNormEntity } from "./entities/base-tariff-and-norm.entity";
import { CommonHouseNeedTariffEntity } from "./entities/house-tariff.entity";
import { CommonHouseNeedTariffData, IBaseTariffAndNorm, ICommonHouseNeedTariff, IHouse, ITypeOfService, IUnit, MunicipalTariffData, NormData, SeasonalityFactorData, SocialNormData, TariffAndNormType, UserRole } from "@myhome/interfaces";
import { ReferenceAddTariffOrNorm, ReferenceGetAllTariffs, ReferenceUpdateTariffOrNorm } from "@myhome/contracts";
import { TYPE_OF_SERVICE_NOT_EXIST, UNIT_NOT_EXIST, INCORRECT_PARAM, INCORRECT_TARIFF_AND_NORM_TYPE, TARIFF_AND_NORM_NOT_EXIST, TARIFFS_NOT_EXIST, RMQException, HOUSES_NOT_EXIST, TYPES_OF_SERVICE_NOT_EXIST, UNITS_NOT_EXIST, HOUSE_NOT_EXIST } from "@myhome/constants";
import { TypeOfServiceRepository } from "../common/repositories/type-of-service.repository";
import { UnitRepository } from "../common/repositories/unit.repository";
import { HouseService } from "../subscriber/services/house.service";


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
        private readonly houseService: HouseService,
    ) { }

    public async getTariffsAndNormsByUser(
        managementCompanyId: number,
        type: TariffAndNormType
    ) {
        let tItems: CommonHouseNeedTariffEntity[], gettedTNs: ICommonHouseNeedTariff[];
        let houses: IHouse[], houseIds: number[], units: IUnit[];

        const typesOfService = await this.typeOfServiceRepository.findAll();
        if (!typesOfService && !typesOfService.length) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }

        const enrich = (items: IBaseTariffAndNorm[]) => {
            return items.map(item => {
                const currentTypeOfService = typesOfService.find(tos => tos.id === item.typeOfServiceId);
                return {
                    ...item,
                    typeOfServiceName: currentTypeOfService.name
                }
            })
        };

        const enrichWithUnit = async (items: (IBaseTariffAndNorm & { unitId: number })[]) => {
            const units = await this.unitRepository.findAll();
            if (!units && !units.length) {
                throw new RMQException(UNITS_NOT_EXIST.message, UNITS_NOT_EXIST.status);
            }

            return items.map(item => {
                const currentTypeOfService = typesOfService.find(tos => tos.id === item.typeOfServiceId);
                const currentUnit = units.find(u => u.id === item.unitId);
                return {
                    ...item,
                    typeOfServiceName: currentTypeOfService.name,
                    unitName: currentUnit.name,
                }
            })
        };

        switch (type) {
            case TariffAndNormType.Norm:
                return {
                    tariffAndNorms: await enrichWithUnit(
                        await this.genericGetTariffsAndNormsByMCId<NormEntity>
                            (
                                this.normRepository,
                                managementCompanyId, (item) => new NormEntity(item),
                                'Нормы'
                            )
                    )
                };
            case TariffAndNormType.SeasonalityFactor:
                return {
                    tariffAndNorms: enrich(
                        await this.genericGetTariffsAndNormsByMCId<SeasonalityFactorEntity>
                            (
                                this.seasonalityFactorRepository,
                                managementCompanyId,
                                (item) => new SeasonalityFactorEntity(item),
                                'Сезонные факторы'
                            )
                    )
                };
            case TariffAndNormType.MunicipalTariff:
                return {
                    tariffAndNorms: await enrichWithUnit(
                        await this.genericGetTariffsAndNormsByMCId<MunicipalTariffEntity>
                            (
                                this.municipalTariffRepository,
                                managementCompanyId,
                                (item) => new MunicipalTariffEntity(item),
                                'Муниципальные тарифы'
                            )
                    )
                };
            case TariffAndNormType.SocialNorm:
                return {
                    tariffAndNorms: await enrichWithUnit(
                        await this.genericGetTariffsAndNormsByMCId<SocialNormEntity>
                            (
                                this.socialNormRepository,
                                managementCompanyId,
                                (item) => new SocialNormEntity(item),
                                'Социальные нормы'
                            )
                    )
                };
            case TariffAndNormType.CommonHouseNeedTariff:
                ({ houses } = await this.houseService.getHousesByUser({
                    userId: managementCompanyId,
                    userRole: UserRole.ManagementCompany,
                    isAllInfo: false
                }));
                if (!houses && !houses.length) {
                    throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
                }
                houseIds = houses.map(house => house.id);

                units = await this.unitRepository.findAll();
                if (!units && !units.length) {
                    throw new RMQException(UNITS_NOT_EXIST.message, UNITS_NOT_EXIST.status);
                }

                tItems = await this.commonHouseNeedTariffRepository.findByHouseIds(houseIds);
                if (!tItems && !tItems.length) {
                    throw new RMQException(
                        `Тарифы на общедомовые для управляющей компании с id=${managementCompanyId} не существуют`,
                        HttpStatus.NOT_FOUND);
                }
                gettedTNs = tItems.map(item => {
                    const newItem = new CommonHouseNeedTariffEntity(item);
                    const currentTypeOfService = typesOfService.find(tos => tos.id === item.typeOfServiceId);
                    const currentUnit = units.find(u => u.id === item.unitId);
                    const currentHouse = houses.find(house => house.id === item.houseId);

                    return {
                        ...newItem,
                        typeOfServiceName: currentTypeOfService.name,
                        unitName: currentUnit.name,
                        houseName: `${currentHouse.city}, ${currentHouse.street}, д. ${currentHouse.houseNumber}`
                    }
                });
                return { tariffAndNorms: gettedTNs };
            default:
                throw new RMQException(`Такие сущности для управляющей компании с id=${managementCompanyId} не существуют`, HttpStatus.CONFLICT);
        }
    }

    private async genericGetTariffsAndNormsByMCId<T extends BaseTariffAndNormEntity>(
        repository: IGenericTariffAndNormRepository<T>,
        managementCompanyId: number,
        createInstance: (item: T) => T,
        errorText: string,
    ): Promise<T[]> {
        const tItems = await repository.findByMCId(managementCompanyId);
        if (!tItems && !tItems.length) {
            throw new RMQException(
                `${errorText} для управляющей компании с id=${managementCompanyId} не существуют`,
                HttpStatus.NOT_FOUND);
        }

        const gettedTNs = tItems.map(item => createInstance(item));
        return gettedTNs;
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

    public async addTariffAndNorm(dto: ReferenceAddTariffOrNorm.Request): Promise<ReferenceAddTariffOrNorm.Response> {
        const typeOfServiceId = dto.typeOfServiceId;
        const typeOfService = await this.typeOfServiceRepository.findById(typeOfServiceId);
        if (!typeOfService) {
            throw new RMQException(TYPE_OF_SERVICE_NOT_EXIST.message(typeOfServiceId), TYPE_OF_SERVICE_NOT_EXIST.status);
        }
        switch (dto.type) {
            case TariffAndNormType.Norm: {
                const data = dto.data as NormData;
                const unit = await this.checkUnit(data.unitId);
                return await this.genericAddTariffAndNorm<NormEntity>(
                    this.normRepository,
                    { typeOfServiceId, ...data }, NormEntity,
                    typeOfService, unit
                )
            }
            case TariffAndNormType.SeasonalityFactor: {
                const data = dto.data as SeasonalityFactorData;
                return await this.genericAddTariffAndNorm<SeasonalityFactorEntity>(
                    this.seasonalityFactorRepository,
                    { typeOfServiceId, ...data }, SeasonalityFactorEntity,
                    typeOfService
                )
            }
            case TariffAndNormType.MunicipalTariff: {
                const data = dto.data as MunicipalTariffData;
                const unit = await this.checkUnit(data.unitId);
                return await this.genericAddTariffAndNorm<MunicipalTariffEntity>(
                    this.municipalTariffRepository,
                    { typeOfServiceId, ...data },
                    MunicipalTariffEntity,
                    typeOfService, unit
                )
            }
            case TariffAndNormType.SocialNorm: {
                const data = dto.data as SocialNormData;
                const unit = await this.checkUnit(data.unitId);
                return await this.genericAddTariffAndNorm<SocialNormEntity>(
                    this.socialNormRepository,
                    { typeOfServiceId, ...data },
                    SocialNormEntity,
                    typeOfService, unit
                )
            }
            case TariffAndNormType.CommonHouseNeedTariff: {
                const data = dto.data as CommonHouseNeedTariffData;
                const unit = await this.checkUnit(data.unitId);
                const { houses } = await this.houseService.getHouses({ houseIds: [data.houseId], isAllInfo: false });
                if (!houses && !houses[0]) {
                    throw new RMQException(HOUSE_NOT_EXIST.message(data.houseId), HOUSE_NOT_EXIST.status);
                }
                const currentHouse = houses[0];
                const newTEntity = new CommonHouseNeedTariffEntity({ typeOfServiceId, ...data });
                const newT = await this.commonHouseNeedTariffRepository.create(newTEntity);
                return {
                    tariffAndNorm: {
                        ...newT,
                        typeOfServiceName: typeOfService.name,
                        unitName: unit.name,
                        houseName: `${currentHouse.city}, ${currentHouse.street}, д. ${currentHouse.houseNumber}`
                    }
                };
            }
            default:
                throw new RMQException(INCORRECT_TARIFF_AND_NORM_TYPE, HttpStatus.CONFLICT);
        }

    }

    private async checkUnit(unitId: number) {
        const unit = await this.unitRepository.findUnitById(unitId);
        if (!unit) {
            throw new RMQException(UNIT_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
        return unit;
    }

    private async genericAddTariffAndNorm<T extends BaseTariffAndNormEntity>(
        repository: IGenericTariffAndNormRepository<T>,
        dto: IBaseTariffAndNorm,
        createInstance: new (dto: IBaseTariffAndNorm) => T,
        typeOfService: ITypeOfService,
        unit?: IUnit
    ) {
        const newTEntity = new createInstance(dto);
        const newT = await repository.create(newTEntity);
        return {
            tariffAndNorm: {
                ...newT,
                typeOfServiceName: typeOfService.name,
                unitName: unit ? unit.name : undefined
            }
        };
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
        switch (dto.type) {
            case TariffAndNormType.MunicipalTariff:
                try {
                    return { tariffs: await this.municipalTariffRepository.findByMCId(dto.managementCompanyId) };
                } catch (e) {
                    throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
            case TariffAndNormType.CommonHouseNeedTariff:
                try {
                    return { tariffs: await this.commonHouseNeedTariffRepository.findByHouseId(dto.houseId) };
                } catch (e) {
                    throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
            default:
                throw new RMQException(INCORRECT_TARIFF_AND_NORM_TYPE, HttpStatus.CONFLICT);
        }
    }
}