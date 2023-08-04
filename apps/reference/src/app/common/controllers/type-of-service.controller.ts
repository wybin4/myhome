import { TYPES_OF_SERVICE_NOT_EXIST } from "@myhome/constants";
import { ReferenceGetAllTypesOfService } from "@myhome/contracts";
import { Body, Controller } from "@nestjs/common";
import { RMQValidate, RMQRoute, RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { TypeOfServiceRepository } from "../repositories/type-of-service.repository";

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
}

