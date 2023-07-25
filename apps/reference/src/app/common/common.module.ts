import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { UnitEntity } from "./entities/unit.entity";
import { TypeOfServiceEntity } from "./entities/type-of-service.entity";
import { TypeOfServiceRepository } from "./repositories/type-of-service.repository";
import { UnitRepository } from "./repositories/unit.repository";
import { Repository } from "typeorm";
import { seedTypeOfService } from "./seeds/type-of-service.seed";
import { seedUnit } from "./seeds/unit.seed";

@Module({
    imports: [
        TypeOrmModule.forFeature([TypeOfServiceEntity, UnitEntity]),
    ],
    providers: [TypeOfServiceRepository, UnitRepository],
    exports: [TypeOfServiceRepository, UnitRepository],
    controllers: [],
})
export class CommonModule {
    constructor(
        @InjectRepository(TypeOfServiceEntity)
        private readonly typeOfServiceRepository: Repository<TypeOfServiceEntity>,
        @InjectRepository(UnitEntity)
        private readonly unitRepository: Repository<UnitEntity>,
    ) { }

    async onModuleInit() {
        await seedTypeOfService(this.typeOfServiceRepository);
        await seedUnit(this.unitRepository);
    }
}
