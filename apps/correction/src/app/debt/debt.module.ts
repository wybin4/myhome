import { Module, forwardRef } from "@nestjs/common";
import { PenaltyModule } from "../penalty/penalty.module";
import { DebtController } from "./debt.controller";
import { DebtRepository } from "./debt.repository";
import { DebtService } from "./debt.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Debt, DebtSchema } from "./debt.model";
import { PenaltyService } from "../penalty/services/penalty.service";
import { PenaltyRuleService } from "../penalty/services/penalty-rule.service";
import { CBRService } from "../penalty/services/cbr.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }]),
        forwardRef(() => PenaltyModule),
    ],
    providers: [DebtService, DebtRepository, PenaltyService, PenaltyRuleService, CBRService],
    controllers: [DebtController],
    exports: [DebtRepository],
})
export class DebtModule { }