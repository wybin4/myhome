import { Injectable } from "@nestjs/common";
import { ReferenceGetCommon } from '@myhome/contracts';
import { TypeOfServiceService } from "./type-of-service.service";
import { UnitService } from "./unit.service";

@Injectable()
export class CommonService {
    constructor(
        private readonly unitService: UnitService,
        private readonly typeOfServiceService: TypeOfServiceService,
    ) { }

    async getCommon(): Promise<ReferenceGetCommon.Response> {
        const { typesOfService } = await this.typeOfServiceService.getAll();
        const { units } = await this.unitService.getAll();

        return {
            typesOfService: typesOfService,
            units: units
        };
    }
}
