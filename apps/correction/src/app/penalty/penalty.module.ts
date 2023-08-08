import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { PenaltyController } from "./penalty.controller";
import { PenaltyService } from "./penalty.service";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { PenaltyRepository } from "./repositories/penalty.repository";
import { PenaltyEntity } from "./entities/penalty.entity";
import { PenaltyRuleEntity } from "./entities/penalty-rule.entity";
import { PenaltyRuleRepository } from "./repositories/penalty-rule.repository";
import { Repository, DataSource } from "typeorm";
import { seedPenaltyRule } from "./penalty-rule.seed";
import { PenaltyCalculationRuleEntity } from "./entities/penalty-calculation-rule.entity";
import { PenaltyCalculationRuleRepository } from "./repositories/penalty-calculation-rule.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([PenaltyEntity, PenaltyRuleEntity, PenaltyCalculationRuleEntity]),
    ],
    providers: [PenaltyService, PenaltyRepository, PenaltyRuleRepository, PenaltyCalculationRuleRepository],
    controllers: [PenaltyController],
    exports: [PenaltyRepository, PenaltyRuleRepository, PenaltyCalculationRuleRepository],

})
export class PenaltyModule implements OnModuleInit {
    private readonly tableNames = ['penalty_rules'];

    constructor(
        @InjectRepository(PenaltyRuleEntity)
        private readonly penaltyRuleRepository: Repository<PenaltyRuleEntity>,
        private readonly connection: DataSource,
    ) { }
    async onModuleInit() {
        try {
            const tablesExist = await this.checkTablesExistence();
            if (!tablesExist) {
                await seedPenaltyRule(this.penaltyRuleRepository);
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

