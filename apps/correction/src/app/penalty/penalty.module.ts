import { Logger, Module, OnModuleInit, forwardRef } from "@nestjs/common";
import { PenaltyController } from "./penalty.controller";
import { PenaltyService } from "./penalty.service";
import { PenaltyRuleRepository } from "./repositories/penalty-rule.repository";
import { PenaltyRuleSeeder } from "./penalty-rule.seed";
import { MongooseModule } from "@nestjs/mongoose";
import { PenaltyRule, PenaltyRuleSchema } from "./models/penalty-rule.model";
import { DebtModule } from "../debt/debt.module";

@Module({
    imports: [
        // TypeOrmModule.forFeature([PenaltyEntity]),
        MongooseModule.forFeature([{ name: PenaltyRule.name, schema: PenaltyRuleSchema }]),
        forwardRef(() => DebtModule),

    ],
    providers: [PenaltyService, PenaltyRuleRepository, PenaltyRuleSeeder],
    controllers: [PenaltyController],
    exports: [PenaltyRuleRepository],

})
export class PenaltyModule implements OnModuleInit {
    constructor(private readonly penaltyRuleSeeder: PenaltyRuleSeeder) { }

    async onModuleInit() {
        try {
            const dataExists = await this.penaltyRuleSeeder.checkDataExistence();

            if (!dataExists) {
                await this.penaltyRuleSeeder.seed();
                Logger.log('Seed data inserted successfully');
            } else {
                Logger.log('Penalty rules already exist. Skipping seeding');
            }
        } catch (error) {
            Logger.error('Error seeding penalty rules:', error);
        }
    }

}
