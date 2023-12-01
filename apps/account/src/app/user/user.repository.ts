import { IUser } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, In, ObjectLiteral } from "typeorm";
import { AdminEntity, ManagementCompanyEntity, OwnerEntity } from "./user.entity";

export abstract class IUserRepository<T extends IUser> {
    abstract findByIds(ids: number[]): Promise<T[]>;
    abstract findById(id: number): Promise<T>;
    abstract findByEmail(email: string): Promise<T>;
    abstract findByLink(link: string): Promise<T>;
    abstract create(item: T): Promise<T>;
    abstract update(item: T): Promise<T>;
}

interface User extends ObjectLiteral {
    id: number;
    name?: string;
    email: string;
    passwordHash: string;
    checkingAcount?: string;
}

export class UserRepository<T extends User> implements IUserRepository<T> {
    constructor(
        private readonly repository: Repository<T>,
    ) { }
    async findByIds(ids: number[]): Promise<T[]> {
        return await this.repository.find({
            where: { id: In(ids) } as unknown as FindOptionsWhere<T>
        });
    }

    async findByEmail(email: string): Promise<T> {
        return await this.repository.findOne({
            where: { email: email } as unknown as FindOptionsWhere<T>
        });
    }

    async findByLink(link: string): Promise<T> {
        return await this.repository.findOne({
            where: { link: link } as unknown as FindOptionsWhere<T>
        });
    }

    async create(item: T) {
        return await this.repository.save(item);
    }

    async findById(id: number): Promise<T> {
        return await this.repository.findOne({
            where: { id } as unknown as FindOptionsWhere<T>
        });
    }

    async update(item: T): Promise<T> {
        await this.repository.update(item.id, item);
        return await this.findById(item.id);
    }
}

@Injectable()
export class AdminRepository extends UserRepository<AdminEntity> {
    constructor(
        @InjectRepository(AdminEntity)
        private readonly adminRepository: Repository<AdminEntity>,
    ) { super(adminRepository); }
}

@Injectable()
export class OwnerRepository extends UserRepository<OwnerEntity> {
    constructor(
        @InjectRepository(OwnerEntity)
        private readonly ownerRepository: Repository<OwnerEntity>,
    ) { super(ownerRepository); }

    async findAll() {
        return await this.ownerRepository.find();
    }
}

@Injectable()
export class ManagementCompanyRepository extends UserRepository<ManagementCompanyEntity> {
    constructor(
        @InjectRepository(ManagementCompanyEntity)
        private readonly managementCompanyRepository: Repository<ManagementCompanyEntity>,
    ) { super(managementCompanyRepository); }

    async findAll() {
        return await this.managementCompanyRepository.find();
    }
}

