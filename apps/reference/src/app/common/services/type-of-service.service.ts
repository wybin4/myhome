import { RMQException, TYPES_OF_SERVICE_NOT_EXIST, getGenericObjects } from "@myhome/constants";
import { ReferenceGetAllTypesOfService, ReferenceGetTypesOfService } from '@myhome/contracts';
import { Injectable } from "@nestjs/common";
import { TypeOfServiceRepository } from "../repositories/type-of-service.repository";
import { TypeOfServiceEntity } from "../entities/type-of-service.entity";

@Injectable()
export class TypeOfServiceService {
    constructor(
        private readonly typeOfServiceRepository: TypeOfServiceRepository,
    ) { }

    async getAll(): Promise<ReferenceGetAllTypesOfService.Response> {
        const typesOfService = await this.typeOfServiceRepository.findAll();

        if (!typesOfService || typesOfService.length === 0) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
        const gettedTypesOfService = typesOfService.map(type => type.get());

        return { typesOfService: gettedTypesOfService };
    }

    async getTypesOfService(typeOfServiceIds: number[]): Promise<ReferenceGetTypesOfService.Response> {
        return {
            typesOfService: await getGenericObjects<TypeOfServiceEntity>(
                this.typeOfServiceRepository,
                (item) => new TypeOfServiceEntity(item),
                typeOfServiceIds,
                TYPES_OF_SERVICE_NOT_EXIST
            )
        };
    }
}
