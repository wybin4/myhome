import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { MunicipalTariffEntity, NormEntity, SeasonalityFactorEntity, SocialNormEntity } from "./entities/base-tariff-and-norm.entity";
import { CommonHouseNeedTariffEntity } from "./entities/house-tariff.entity";
import { IMeta, TypeOfNorm } from "@myhome/interfaces";
import { applyMeta } from "@myhome/constants";

interface BaseTariffAndNorm extends ObjectLiteral {
    id: number;
}

export abstract class IGenericTariffAndNormRepository<T extends BaseTariffAndNorm> {
    abstract findById(id: number): Promise<T>;
    abstract findByMCId(managementCompanyId: number, meta: IMeta): Promise<{ tariffAndNorms: T[]; totalCount: number; }>;
    abstract create(item: T): Promise<T>;
    abstract createMany(items: T[]): Promise<T[]>;
    abstract delete(id: number): Promise<void>;
    abstract update(item: T): Promise<T>;
}

export class GenericTariffAndNormRepository<T extends BaseTariffAndNorm> implements IGenericTariffAndNormRepository<T> {
    constructor(
        private readonly repository: Repository<T>,
    ) { }

    async create(item: T) {
        return await this.repository.save(item);
    }

    async createMany(items: T[]) {
        return await this.repository.save(items);
    }

    async findById(id: number): Promise<T> {
        const findOptions: FindOneOptions<T> = {
            where: { id } as unknown as FindOptionsWhere<T>,
        };
        return await this.repository.findOne(findOptions);
    }

    async findByMCId(managementCompanyId: number, meta: IMeta): Promise<{ tariffAndNorms: T[]; totalCount: number; }> {
        let queryBuilder = this.repository.createQueryBuilder('tariffAndNorm');
        queryBuilder.where('tariffAndNorm.managementCompanyId = :managementCompanyId', { managementCompanyId });
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<T>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { tariffAndNorms: await queryBuilder.getMany(), totalCount };
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async update(item: T): Promise<T> {
        await this.repository.update(item.id, item);
        return await this.findById(item.id);
    }
}

@Injectable()
export class NormRepository extends GenericTariffAndNormRepository<NormEntity> {
    constructor(
        @InjectRepository(NormEntity)
        private readonly normRepository: Repository<NormEntity>,
    ) {
        super(normRepository);
    }

    async findByMCIDAndType(managementCompanyId: number, typeOfNorm: TypeOfNorm): Promise<NormEntity[] | undefined> {
        return await this.normRepository.find({
            where: {
                managementCompanyId,
                typeOfNorm
            },
        });
    }

}

@Injectable()
export class MunicipalTariffRepository extends GenericTariffAndNormRepository<MunicipalTariffEntity> {
    constructor(
        @InjectRepository(MunicipalTariffEntity)
        private readonly municipalTariffRepository: Repository<MunicipalTariffEntity>,
    ) {
        super(municipalTariffRepository);
    }
}

@Injectable()
export class SocialNormRepository extends GenericTariffAndNormRepository<SocialNormEntity> {
    constructor(
        @InjectRepository(SocialNormEntity)
        private readonly socialNormRepository: Repository<SocialNormEntity>,
    ) {
        super(socialNormRepository);
    }
}

@Injectable()
export class SeasonalityFactorRepository extends GenericTariffAndNormRepository<SeasonalityFactorEntity> {
    constructor(
        @InjectRepository(SeasonalityFactorEntity)
        private readonly seasonalityFactorRepository: Repository<SeasonalityFactorEntity>,
    ) {
        super(seasonalityFactorRepository);
    }
}

@Injectable()
export class CommonHouseNeedTariffRepository extends GenericTariffAndNormRepository<CommonHouseNeedTariffEntity> {
    constructor(
        @InjectRepository(CommonHouseNeedTariffEntity)
        private readonly сommonHouseNeedTariffRepository: Repository<CommonHouseNeedTariffEntity>,
    ) {
        super(сommonHouseNeedTariffRepository);
    }

    async findByHouseId(houseId: number): Promise<CommonHouseNeedTariffEntity[]> {
        return await this.сommonHouseNeedTariffRepository.find({
            where: {
                houseId: houseId
            },
        });
    }

    async findByHouseIds(houseIds: number[], meta: IMeta): Promise<{ tariffAndNorms: CommonHouseNeedTariffEntity[], totalCount: number }> {
        let queryBuilder = this.сommonHouseNeedTariffRepository.createQueryBuilder('tariffAndNorm');
        queryBuilder.where('tariffAndNorm.houseId IN (:...houseIds)', { houseIds });
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<CommonHouseNeedTariffEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { tariffAndNorms: await queryBuilder.getMany(), totalCount };
    }
}
