import { Module } from "@nestjs/common";
import { PenaltyController } from "./penalty.controller";
import { PenaltyService } from "./penalty.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PenaltyRepository } from "./repositories/penalty.repository";
import { PenaltyEntity } from "./entities/penalty.entity";
import { PenaltyRuleEntity } from "./entities/penalty-rule.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([PenaltyEntity, PenaltyRuleEntity]),
    ],
    providers: [PenaltyService, PenaltyRepository],
    controllers: [PenaltyController],
    exports: [PenaltyRepository],

})
export class PenaltyModule { }
