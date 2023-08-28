import { ReferenceGetAllTypesOfService, ReferenceGetTypeOfService, ReferenceGetTypesOfService } from "@myhome/contracts";
import { Body, Controller } from "@nestjs/common";
import { RMQValidate, RMQRoute, RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { TypeOfServiceService } from "../services/type-of-service.service";

@Controller('type-of-service')
export class TypeOfServiceController {
    constructor(
        private readonly typeOfServiceService: TypeOfServiceService,
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetAllTypesOfService.topic)
    // eslint-disable-next-line no-empty-pattern
    async getAll(@Body() { }: ReferenceGetAllTypesOfService.Request): Promise<ReferenceGetAllTypesOfService.Response> {
        try {
            return await this.typeOfServiceService.getAll();
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetTypeOfService.topic)
    async getTypeOfService(@Body() { id }: ReferenceGetTypeOfService.Request): Promise<ReferenceGetTypeOfService.Response> {
        try {
            return await this.typeOfServiceService.getTypeOfService(id);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetTypesOfService.topic)
    async getTypesOfService(@Body() { typeOfServiceIds }: ReferenceGetTypesOfService.Request): Promise<ReferenceGetTypesOfService.Response> {
        try {
            return await this.typeOfServiceService.getTypesOfService(typeOfServiceIds);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}

