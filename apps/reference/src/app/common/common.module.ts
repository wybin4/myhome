import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { UnitEntity } from "./entities/unit.entity";
import { TypeOfServiceEntity } from "./entities/type-of-service.entity";
import { TypeOfServiceRepository } from "./repositories/type-of-service.repository";
import { UnitRepository } from "./repositories/unit.repository";
import { DataSource, Repository } from "typeorm";
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
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();

      const tableExistencePromises = this.tableNames.map(async (tableName) => {
        const table = await queryRunner.getTable(tableName);
        return !!table;
      });

      const tableExistenceResults = await Promise.all(tableExistencePromises);

      await queryRunner.release();

      return !tableExistenceResults.some((exist) => exist);
    } catch (error) {
      Logger.error('Error checking table existence:', error);
      return false;
    }
  }
}