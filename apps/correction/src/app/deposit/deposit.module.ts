import { Module } from "@nestjs/common";
import { DepositController } from "./deposit.controller";
import { DepositService } from "./deposit.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepositRepository } from "./deposit.repository";
import { DepositEntity } from "./deposit.entity";
import { DebtModule } from "../debt/debt.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([DepositEntity]),
        DebtModule
    ],
    providers: [DepositService, DepositRepository],
    controllers: [DepositController],
    exports: [DepositRepository, DepositService],

})
export class DepositModule { }
