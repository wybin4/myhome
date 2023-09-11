import { HttpStatus } from "@nestjs/common";
import { RMQException } from "../exception";

export interface IEntity {
    id?: number;
}

export abstract class GenericEntity {
    constructor(data?: Partial<GenericEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }
    abstract get(): IEntity
}

export abstract class GenericRepository<T extends GenericEntity> {
    abstract findById(id: number): Promise<T>;
    abstract create(item: T): Promise<T>;
    abstract delete?(id: number): Promise<void>;
    abstract update?(item: T): Promise<T>;
    abstract findMany?(ids: number[]): Promise<T[]>
}

export async function getGenericObject<T extends GenericEntity>(
    repository: GenericRepository<T>,
    createInstance: (item: T) => T,
    id: number,
    error: { message: (id: number) => string; status: HttpStatus },
): Promise<IEntity> {
    const tItem = await repository.findById(id);
    if (!tItem) {
        throw new RMQException(error.message(id), error.status);
    }
    const gettedTN = createInstance(tItem).get();
    return gettedTN;
}

export async function getGenericObjects<T extends GenericEntity>(
    repository: GenericRepository<T>,
    createInstance: (item: T) => T,
    ids: number[],
    error: { message: string; status: HttpStatus },
): Promise<IEntity[] | undefined> {
    if (repository.findMany) {
        const tItems = await repository?.findMany(ids);
        if (!tItems.length) {
            throw new RMQException(error.message, error.status);
        }
        const gettedTNs = [];
        for (const tItem of tItems) {
            gettedTNs.push(createInstance(tItem).get());
        }
        return gettedTNs;
    } else return undefined;
}

export async function addGenericObject<T extends GenericEntity>(
    repository: GenericRepository<T>,
    createInstance: (item: IEntity) => T,
    dto: IEntity
): Promise<T> {
    const newTEntity = createInstance(dto);
    const newTItem = await repository.create(newTEntity);
    return newTItem;
}