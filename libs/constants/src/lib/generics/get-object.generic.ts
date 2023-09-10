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