import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { AppealEntity, TypeOfAppealEntity } from "./entities/appeal.entity";
import { AppealRepository, TypeOfAppealRepository } from "./repositories/appeal.repository";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { AppealController } from "./appeal.controller";
import { Repository, DataSource } from "typeorm";
import { seedTypeOfAppeal } from "./seeds/type-of-appeal.seed";
import { AppealService } from "./appeal.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([AppealEntity, TypeOfAppealEntity]),
    ],
    providers: [
        AppealRepository, TypeOfAppealRepository,
        AppealService,
    ],
    exports: [
        AppealRepository, TypeOfAppealRepository
    ],
    controllers: [AppealController],
})
export class AppealModule implements OnModuleInit {
    private readonly tableNames = ['types_of_appeal'];

    constructor(
        @InjectRepository(TypeOfAppealEntity)
        private readonly typeOfAppealRepository: Repository<TypeOfAppealEntity>,
        private readonly connection: DataSource,
    ) { }
    async onModuleInit() {
        try {
            const tablesExist = await this.checkTablesExistence();
            if (!tablesExist) {
                await seedTypeOfAppeal(this.typeOfAppealRepository);
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