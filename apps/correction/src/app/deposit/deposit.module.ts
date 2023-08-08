import { Module } from "@nestjs/common";
import { DepositController } from "./deposit.controller";
import { DepositService } from "./deposit.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepositRepository } from "./deposit.repository";
import { DepositEntity } from "./deposit.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([DepositEntity]),
    ],
    providers: [DepositService, DepositRepository],
    controllers: [DepositController],
    exports: [DepositRepository],

})
export class DepositModule { }
