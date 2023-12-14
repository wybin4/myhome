import { HttpStatus, Injectable } from "@nestjs/common";
import { CommonHouseNeedTariffRepository, IGenericTariffAndNormRepository, MunicipalTariffRepository, NormRepository, SeasonalityFactorRepository, SocialNormRepository } from "./base-tariff-and-norm.repository";
import { NormEntity, SeasonalityFactorEntity, MunicipalTariffEntity, SocialNormEntity, BaseTariffAndNormEntity } from "./entities/base-tariff-and-norm.entity";
import { CommonHouseNeedTariffEntity } from "./entities/house-tariff.entity";
import { CommonHouseNeedTariffData, IBaseTariffAndNorm, IMeta, ITypeOfService, IUnit, MunicipalTariffData, NormData, SocialNormData, TariffAndNormType, UserRole } from "@myhome/interfaces";
import { ReferenceGetTariffsOrNormsByUser, IAddTariffAndNorm, ReferenceAddTariffsOrNorms, ReferenceGetAllTariffs, ReferenceUpdateTariffOrNorm, IGetTariffAndNorm } from "@myhome/contracts";
import { UNIT_NOT_EXIST, INCORRECT_PARAM, INCORRECT_TARIFF_AND_NORM_TYPE, TARIFF_AND_NORM_NOT_EXIST, TARIFFS_NOT_EXIST, RMQException, HOUSES_NOT_EXIST, TYPES_OF_SERVICE_NOT_EXIST, UNITS_NOT_EXIST } from "@myhome/constants";
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
        private readonly typeOfServiceRepository: TypeOfServiceRepository,
        private readonly unitRepository: UnitRepository,
        private readonly houseService: HouseService,
    ) { }

    public async getTariffsAndNormsByUser(dto: ReferenceGetTariffsOrNormsByUser.Request):
        Promise<ReferenceGetTariffsOrNormsByUser.Response> {
        const typesOfService = await this.typeOfServiceRepository.findAll();
        if (!typesOfService && !typesOfService.length) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }

        const enrich = (items: {
            tariffAndNorms: IBaseTariffAndNorm[]; totalCount: number
        }): { tariffAndNorms: IGetTariffAndNorm[]; totalCount: number; } => {
            return {
                tariffAndNorms: items.tariffAndNorms.map(item => {
                    const currentTypeOfService = typesOfService.find(tos => tos.id === item.typeOfServiceId);
                    return {
                        ...item,
                        typeOfServiceName: currentTypeOfService.name
                    }
                }),
                totalCount: items.totalCount
            }
        };

        const enrichWithUnit = async (items: {
            tariffAndNorms: (IBaseTariffAndNorm & { unitId: number })[];
            totalCount: number
        }): Promise<{ tariffAndNorms: IGetTariffAndNorm[]; totalCount: number; }> => {
            const units = await this.unitRepository.findAll();
            if (!units && !units.length) {
                throw new RMQException(UNITS_NOT_EXIST.message, UNITS_NOT_EXIST.status);
            }

            return {
                tariffAndNorms: items.tariffAndNorms.map(item => {
                    const currentTypeOfService = typesOfService.find(tos => tos.id === item.typeOfServiceId);
                    const currentUnit = units.find(u => u.id === item.unitId);
                    return {
                        ...item,
                        typeOfServiceName: currentTypeOfService.name,
                        unitName: currentUnit.name,
                    }
                }),
                totalCount: items.totalCount
            }
        };

        switch (dto.type) {
            case TariffAndNormType.Norm:
                return await enrichWithUnit(
                    await this.genericGetTariffsAndNormsByMCId<NormEntity>
                        (
                            this.normRepository,
                            dto.managementCompanyId, dto.meta, (item) => new NormEntity(item),
                            'Нормы'
                        )
                );
            case TariffAndNormType.SeasonalityFactor:
                return enrich(
                    await this.genericGetTariffsAndNormsByMCId<SeasonalityFactorEntity>
                        (
                            this.seasonalityFactorRepository,
                            dto.managementCompanyId, dto.meta,
                            (item) => new SeasonalityFactorEntity(item),
                            'Сезонные факторы'
                        )
                );
            case TariffAndNormType.MunicipalTariff:
                return await enrichWithUnit(
                    await this.genericGetTariffsAndNormsByMCId<MunicipalTariffEntity>
                        (
                            this.municipalTariffRepository,
                            dto.managementCompanyId, dto.meta,
                            (item) => new MunicipalTariffEntity(item),
                            'Муниципальные тарифы'
                        )
                );
            case TariffAndNormType.SocialNorm:
                return await enrichWithUnit(
                    await this.genericGetTariffsAndNormsByMCId<SocialNormEntity>
                        (
                            this.socialNormRepository,
                            dto.managementCompanyId, dto.meta,
                            (item) => new SocialNormEntity(item),
                            'Социальные нормы'
                        )
                );
            case TariffAndNormType.CommonHouseNeedTariff: {
                const { houses } = await this.houseService.getHousesByUser({
                    userId: dto.managementCompanyId,
                    userRole: UserRole.ManagementCompany,
                    isAllInfo: false
                });
                if (!houses && !houses.length) {
                    throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
                }
                const houseIds = houses.map(house => house.id);

                const units = await this.unitRepository.findAll();
                if (!units && !units.length) {
                    throw new RMQException(UNITS_NOT_EXIST.message, UNITS_NOT_EXIST.status);
                }

                const { tariffAndNorms, totalCount } = await this.commonHouseNeedTariffRepository.findByHouseIds(houseIds, dto.meta);
                if (!tariffAndNorms && !tariffAndNorms.length) {
                    throw new RMQException(
                        `Тарифы на общедомовые для управляющей компании с id=${dto.managementCompanyId} не существуют`,
                        HttpStatus.NOT_FOUND);
                }
                const gettedTNs = tariffAndNorms.map(item => {
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
                return { tariffAndNorms: gettedTNs, totalCount }
            };
            default:
                throw new RMQException(`Такие сущности для управляющей компании с id=${dto.managementCompanyId} не существуют`, HttpStatus.CONFLICT);
        }
    }

    private async genericGetTariffsAndNormsByMCId<T extends BaseTariffAndNormEntity>(
        repository: IGenericTariffAndNormRepository<T>,
        managementCompanyId: number, meta: IMeta,
        createInstance: (item: T) => T,
        errorText: string,
    ) {
        const { tariffAndNorms, totalCount } = await repository.findByMCId(managementCompanyId, meta);
        if (!tariffAndNorms && !tariffAndNorms.length) {
            throw new RMQException(
                `${errorText} для управляющей компании с id=${managementCompanyId} не существуют`,
                HttpStatus.NOT_FOUND);
        }

        const gettedTNs = tariffAndNorms.map(item => createInstance(item));
        return { tariffAndNorms: gettedTNs, totalCount };
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

    public async addTariffAndNorms(dto: ReferenceAddTariffsOrNorms.Request): Promise<ReferenceAddTariffsOrNorms.Response> {
        const typeOfServiceIds = dto.tariffAndNorms.map(tn => tn.typeOfServiceId);
        const typesOfService = await this.typeOfServiceRepository.findMany(typeOfServiceIds);
        if (!typesOfService.length) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
        const type = dto.tariffAndNorms[0].type;
        const { tariffAndNorms } = dto;
        switch (type) {
            case TariffAndNormType.Norm: {
                const units = await this.checkUnits(tariffAndNorms.map(tn => (tn.data as NormData).unitId));
                return await this.genericAddTariffsAndNorms<NormEntity>(
                    this.normRepository,
                    tariffAndNorms, NormEntity,
                    typesOfService, units
                )
            }
            case TariffAndNormType.SeasonalityFactor: {
                return await this.genericAddTariffsAndNorms<SeasonalityFactorEntity>(
                    this.seasonalityFactorRepository,
                    tariffAndNorms, SeasonalityFactorEntity,
                    typesOfService
                )
            }
            case TariffAndNormType.MunicipalTariff: {
                const units = await this.checkUnits(tariffAndNorms.map(tn => (tn.data as MunicipalTariffData).unitId));
                return await this.genericAddTariffsAndNorms<MunicipalTariffEntity>(
                    this.municipalTariffRepository,
                    tariffAndNorms,
                    MunicipalTariffEntity,
                    typesOfService, units
                )
            }
            case TariffAndNormType.SocialNorm: {
                const units = await this.checkUnits(tariffAndNorms.map(tn => (tn.data as SocialNormData).unitId));
                return await this.genericAddTariffsAndNorms<SocialNormEntity>(
                    this.socialNormRepository,
                    dto.tariffAndNorms,
                    SocialNormEntity,
                    typesOfService, units
                )
            }
            case TariffAndNormType.CommonHouseNeedTariff: {
                const units = await this.checkUnits(tariffAndNorms.map(tn => (tn.data as CommonHouseNeedTariffData).unitId));
                const houseIds = tariffAndNorms.map(tn => (tn.data as CommonHouseNeedTariffData).houseId)
                const { houses } = await this.houseService.getHouses({ houseIds: houseIds, isAllInfo: false });
                if (!houses.length) {
                    throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
                }
                const newTEntities = dto.tariffAndNorms.map(tn => {
                    return new CommonHouseNeedTariffEntity({ ...tn.data, typeOfServiceId: tn.typeOfServiceId });
                });
                const newTs = await this.commonHouseNeedTariffRepository.createMany(newTEntities);
                return {
                    tariffAndNorms: newTs.map(newT => {
                        const currToS = typesOfService.find(tos => tos.id === newT.typeOfServiceId);
                        const currUnit = units ? units.find(unit => unit.id === newT.unitId) : undefined;
                        return {
                            ...newT,
                            typeOfServiceName: currToS.name,
                            unitName: currUnit ? currUnit.name : undefined
                        };
                    })
                };
            }
            default:
                throw new RMQException(INCORRECT_TARIFF_AND_NORM_TYPE, HttpStatus.CONFLICT);
        }
    }

    private async checkUnits(unitIds: number[]) {
        const units = await this.unitRepository.findMany(unitIds);
        if (!units.length) {
            throw new RMQException(UNIT_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
        return units;
    }

    private async genericAddTariffsAndNorms<T extends BaseTariffAndNormEntity & { unitId?: number }>(
        repository: IGenericTariffAndNormRepository<T>,
        dto: IAddTariffAndNorm[],
        createInstance: new (dto: IBaseTariffAndNorm) => T,
        typesOfService: ITypeOfService[],
        units?: IUnit[]
    ) {
        const newTEntities = dto.map(tn => {
            return new createInstance({ ...tn.data, typeOfServiceId: tn.typeOfServiceId });
        });
        const newTs = await repository.createMany(newTEntities);
        return {
            tariffAndNorms: newTs.map(newT => {
                const currToS = typesOfService.find(tos => tos.id === newT.typeOfServiceId);
                const currUnit = units ? units.find(unit => unit.id === newT.unitId) : undefined;
                return {
                    ...newT,
                    typeOfServiceName: currToS.name,
                    unitName: currUnit ? currUnit.name : undefined
                };
            })
        };
    }

    public async updateTariffAndNorm(dto: ReferenceUpdateTariffOrNorm.Request) {
        let existedT: CommonHouseNeedTariffEntity, tEntity: Promise<CommonHouseNeedTariffEntity>;

        switch (dto.type) {
            case TariffAndNormType.Norm:
                if (!dto.norm) {
                    throw new RMQException(INCORRECT_PARAM + 'norm', HttpStatus.BAD_REQUEST);
                }
                return await this.genericUpdateTariffAndNorm<NormEntity>(
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
                return await this.genericUpdateTariffAndNorm<SeasonalityFactorEntity>(
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
                return await this.genericUpdateTariffAndNorm<MunicipalTariffEntity>(
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
                return await this.genericUpdateTariffAndNorm<SocialNormEntity>(
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

    public async getAllTariffs(dto: ReferenceGetAllTariffs.Request): Promise<ReferenceGetAllTariffs.Response> {
        switch (dto.type) {
            case TariffAndNormType.MunicipalTariff:
                try {
                    return await this.municipalTariffRepository.findByMCId(dto.managementCompanyId, undefined);
                } catch (e) {
                    throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
            case TariffAndNormType.CommonHouseNeedTariff:
                try {
                    return { tariffAndNorms: await this.commonHouseNeedTariffRepository.findByHouseId(dto.houseId) };
                } catch (e) {
                    throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
            default:
                throw new RMQException(INCORRECT_TARIFF_AND_NORM_TYPE, HttpStatus.CONFLICT);
        }
    }
}