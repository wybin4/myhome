import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { UnitEnitity } from "./entities/unit.entity";
import { TypeOfServiceEnitity } from "./entities/type-of-service.entity";
import { TypeOfServiceRepository } from "./repositories/type-of-service.repository";
import { UnitRepository } from "./repositories/unit.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([TypeOfServiceEnitity, UnitEnitity]),
    ],
    providers: [TypeOfServiceRepository, UnitRepository],
    exports: [TypeOfServiceRepository, UnitRepository],
    controllers: [],
})
export class CommonModule { }