import { RMQException, TYPES_OF_SERVICE_NOT_EXIST, TYPE_OF_SERVICE_NOT_EXIST } from "@myhome/constants";
import { ReferenceGetAllTypesOfService, ReferenceGetTypeOfService, ReferenceGetTypesOfService } from '@myhome/contracts';
import { Injectable } from "@nestjs/common";
import { TypeOfServiceRepository } from "../repositories/type-of-service.repository";
import { TypeOfServiceEntity } from "../entities/type-of-service.entity";

@Injectable()
export class TypeOfServiceService {
    constructor(
        private readonly typeOfServiceRepository: TypeOfServiceRepository,
    ) { }

    async getAll(): Promise<ReferenceGetAllTypesOfService.Response> {
        const typesOfService = await this.typeOfServiceRepository.findAllTypesOfService();

        if (!typesOfService || typesOfService.length === 0) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
        const gettedTypesOfService = typesOfService.map(type => type.getTypeOfServiceWithId());

        return { typesOfService: gettedTypesOfService };
    }

    async getTypeOfService(id: number): Promise<ReferenceGetTypeOfService.Response> {
        const typeOfService = await this.typeOfServiceRepository.findTypeOfServiceById(id);
        if (!typeOfService) {
            throw new RMQException(TYPE_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
        const gettedTypeOfService = new TypeOfServiceEntity(typeOfService).getTypeOfService();
        return { typeOfService: gettedTypeOfService };
    }

    async getTypesOfService(typeOfServiceIds: number[]): Promise<ReferenceGetTypesOfService.Response> {
        const typesOfService = await this.typeOfServiceRepository.findTypesOfServiceById(typeOfServiceIds);
        if (!typesOfService) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
        const gettedTypesOfService = [];
        for (const typeOfService of typesOfService) {
            gettedTypesOfService.push(new TypeOfServiceEntity(typeOfService));
        }
        return { typesOfService: gettedTypesOfService };
    }
}
