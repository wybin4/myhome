import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { DebtController } from "./controllers/debt.controller";
import { DebtRepository } from "./repositories/debt.repository";
import { DebtService } from "./services/debt.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Debt, DebtSchema } from "./models/debt.model";
import { PenaltyService } from "./services/penalty.service";
import { PenaltyRuleService } from "./services/penalty-rule.service";
import { CBRService } from "./services/cbr.service";
import { PenaltyRuleSeeder } from "./seeds/penalty-rule.seed";
import { PenaltyController } from "./controllers/penalty.controller";
import { PenaltyRule, PenaltyRuleSchema } from "./models/penalty-rule.model";
import { PenaltyRuleRepository } from "./repositories/penalty-rule.repository";
import { CBRController } from "./controllers/cbr.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Debt.name, schema: DebtSchema },
            { name: PenaltyRule.name, schema: PenaltyRuleSchema }
        ]),
    ],
    providers: [
        DebtService, DebtRepository,
        PenaltyService, PenaltyRuleService, CBRService, PenaltyRuleRepository, PenaltyRuleSeeder
    ],
    controllers: [DebtController, PenaltyController, CBRController],
    exports: [DebtRepository, PenaltyRuleRepository, PenaltyService, DebtService],
})

export class DebtModule implements OnModuleInit {
    constructor(private readonly penaltyRuleSeeder: PenaltyRuleSeeder) { }

    async onModuleInit() {
        try {
            const dataExists = await this.penaltyRuleSeeder.checkDataExistence();

            if (!dataExists) {
                await this.penaltyRuleSeeder.seed();
                Logger.log('Penalty rules inserted successfully');
            } else {
                Logger.log('Penalty rules already exist. Skipping seeding');
            }
        } catch (error) {
            Logger.error('Error seeding penalty rules:', error);
        }
    }

}
