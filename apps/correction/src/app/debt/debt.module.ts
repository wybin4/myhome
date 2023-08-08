import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PenaltyModule } from "../penalty/penalty.module";
import { DebtController } from "./debt.controller";
import { DebtEntity } from "./debt.entity";
import { DebtRepository } from "./debt.repository";
import { DebtService } from "./debt.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([DebtEntity]),
        PenaltyModule,
    ],
    providers: [DebtService, DebtRepository],
    controllers: [DebtController],
    exports: [DebtRepository],
})
export class DebtModule { }