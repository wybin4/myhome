import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { UnitEnitity } from "./entities/unit.entity";
import { TypeOfServiceEnitity } from "./entities/type-of-service.entity";
import { TypeOfServiceRepository } from "./repositories/type-of-service.repository";
import { UnitRepository } from "./repositories/unit.repository";
import { Repository } from "typeorm";
import { seedTypeOfService } from "./seeds/type-of-service.seed";
import { seedUnit } from "./seeds/unit.seed";

@Module({
    imports: [
        TypeOrmModule.forFeature([TypeOfServiceEnitity, UnitEnitity]),
    ],
    providers: [TypeOfServiceRepository, UnitRepository],
    exports: [TypeOfServiceRepository, UnitRepository],
    controllers: [],
})
export class CommonModule {
    constructor(
        @InjectRepository(TypeOfServiceEnitity)
        private readonly typeOfServiceRepository: Repository<TypeOfServiceEnitity>,
        @InjectRepository(UnitEnitity)
        private readonly unitRepository: Repository<UnitEnitity>,
    ) { }

    async onModuleInit() {
        await seedTypeOfService(this.typeOfServiceRepository);
        await seedUnit(this.unitRepository);
    }
}
