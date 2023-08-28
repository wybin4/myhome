import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { UnitEntity } from "./entities/unit.entity";
import { TypeOfServiceEntity } from "./entities/type-of-service.entity";
import { TypeOfServiceRepository } from "./repositories/type-of-service.repository";
import { UnitRepository } from "./repositories/unit.repository";
import { DataSource, Repository } from "typeorm";
import { seedTypeOfService } from "./seeds/type-of-service.seed";
import { seedUnit } from "./seeds/unit.seed";
import { TypeOfServiceController } from "./controllers/type-of-service.controller";
import { CommonController } from "./controllers/common.controller";
import { CommonService } from "./services/common.service";
import { UnitService } from "./services/unit.service";
import { TypeOfServiceService } from "./services/type-of-service.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOfServiceEntity, UnitEntity]),
  ],
  providers: [TypeOfServiceRepository, UnitRepository, CommonService, UnitService, TypeOfServiceService],
  exports: [TypeOfServiceRepository, UnitRepository],
  controllers: [TypeOfServiceController, CommonController],
})

export class CommonModule implements OnModuleInit {
  private readonly tableNames = ['type_of_services', 'units'];

  constructor(
    @InjectRepository(TypeOfServiceEntity)
    private readonly typeOfServiceRepository: Repository<TypeOfServiceEntity>,
    @InjectRepository(UnitEntity)
    private readonly unitRepository: Repository<UnitEntity>,
    private readonly connection: DataSource,
  ) { }
  async onModuleInit() {
    try {
      const tablesExist = await this.checkTablesExistence();
      if (!tablesExist) {
        await seedTypeOfService(this.typeOfServiceRepository);
        await seedUnit(this.unitRepository);
        Logger.log('Seed data inserted successfully');
      } else {
        Logger.log('Tables already exist. Skipping seeding');
      }
    } catch (error) {
      Logger.error('Error seeding data:', error);
    }
  }

  private async checkTablesExistence(): Promise<boolean> {
    try {
      const hasDataPromises = this.tableNames.map(async (tableName) => {
        const count = await this.connection.manager.count(tableName);
        return count > 0;
      });

      const hasDataResults = await Promise.all(hasDataPromises);

      return hasDataResults.some((hasData) => hasData);
    } catch (error) {
      Logger.error('Error checking table existence:', error);
      return false;
    }
  }

}