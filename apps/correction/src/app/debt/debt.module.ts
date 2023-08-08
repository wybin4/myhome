import { Module } from "@nestjs/common";
import { DebtController } from "./debt.controller";
import { DebtService } from "./debt.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DebtRepository } from "./debt.repository";
import { DebtEntity } from "./debt.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([DebtEntity]),
    ],
    providers: [DebtService, DebtRepository],
    controllers: [DebtController],
    exports: [DebtRepository],

})
export class DebtModule { }
