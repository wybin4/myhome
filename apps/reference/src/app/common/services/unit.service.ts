import { RMQException, UNITS_NOT_EXIST } from "@myhome/constants";
import { Injectable } from "@nestjs/common";
import { UnitRepository } from "../repositories/unit.repository";

@Injectable()
export class UnitService {
    constructor(
        private readonly unitRepository: UnitRepository
    ) { }

    async getAll() {
        const units = await this.unitRepository.findAll();

        if (!units || units.length === 0) {
            throw new RMQException(UNITS_NOT_EXIST.message, UNITS_NOT_EXIST.status);
        }
        const gettedUnits = units.map(unit => unit.getWithId());

        return { units: gettedUnits };
    }
}
