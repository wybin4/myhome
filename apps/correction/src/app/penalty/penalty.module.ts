import { Module } from "@nestjs/common";
import { PenaltyController } from "./penalty.controller";
import { PenaltyService } from "./penalty.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PenaltyRepository } from "./penalty.repository";
import { PenaltyEntity } from "./penalty.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([PenaltyEntity]),
    ],
    providers: [PenaltyService, PenaltyRepository],
    controllers: [PenaltyController],
    exports: [PenaltyRepository],

})
export class PenaltyModule { }
