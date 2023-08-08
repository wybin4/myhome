import { TYPES_OF_SERVICE_NOT_EXIST, TYPE_OF_SERVICE_NOT_EXIST } from "@myhome/constants";
import { ReferenceGetAllTypesOfService, ReferenceGetTypeOfService } from "@myhome/contracts";
import { Body, Controller } from "@nestjs/common";
import { RMQValidate, RMQRoute, RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { TypeOfServiceRepository } from "../repositories/type-of-service.repository";
import { TypeOfServiceEntity } from "../entities/type-of-service.entity";

@Controller('type-of-service')
export class TypeOfServiceController {
    constructor(
        private readonly typeOfServiceRepository: TypeOfServiceRepository,
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetAllTypesOfService.topic)
    // eslint-disable-next-line no-empty-pattern
    async getAll(@Body() { }: ReferenceGetAllTypesOfService.Request): Promise<ReferenceGetAllTypesOfService.Response> {
        const typesOfService = await this.typeOfServiceRepository.findAllTypesOfService();

        if (!typesOfService || typesOfService.length === 0) {
            throw new RMQError(TYPES_OF_SERVICE_NOT_EXIST.message, ERROR_TYPE.RMQ, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
        const gettedTypesOfService = typesOfService.map(type => type.getTypeOfServiceWithId());

        return { typesOfService: gettedTypesOfService };
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetTypeOfService.topic)
    async getTypeOfService(@Body() { id }: ReferenceGetTypeOfService.Request): Promise<ReferenceGetTypeOfService.Response> {
        const typeOfService = await this.typeOfServiceRepository.findTypeOfServiceById(id);
        if (!typeOfService) {
            throw new RMQError(TYPE_OF_SERVICE_NOT_EXIST.message, ERROR_TYPE.RMQ, TYPES_OF_SERVICE_NOT_EXIST.status);
        }
        const gettedTypeOfService = new TypeOfServiceEntity(typeOfService).getTypeOfService();
        return { typeOfService: gettedTypeOfService };
    }
}

