import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { AppealEntity, TypeOfAppealEntity } from "./appeal.entity";
import { AppealRepository, TypeOfAppealRepository } from "./appeal.repository";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { AppealController } from "./appeal.controller";
import { Repository, DataSource } from "typeorm";
import { seedTypeOfAppeal } from "./type-of-appeal.seed";
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
        AppealService
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
                Logger.log('TypesOfAppeal inserted successfully');
            } else {
                Logger.log('TypesOfAppeal already exist. Skipping seeding');
            }
        } catch (error) {
            Logger.error('Error seeding typesOfAppeal:', error);
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