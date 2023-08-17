import { Injectable } from "@nestjs/common";
import { DebtService } from "./debt/services/debt.service";
import { PenaltyService } from "./debt/services/penalty.service";
import { DepositService } from "./deposit/deposit.service";
import { ICalculateDebtsRequest } from "@myhome/contracts";

@Injectable()
export class CorrectionService {
    constructor(
        private readonly penaltyService: PenaltyService,
        private readonly debtService: DebtService,
        private readonly depositService: DepositService,
    ) { }

    async getAllData(subscriberSPDs: ICalculateDebtsRequest[]) {
        const debtData = await this.debtService.calculateDebts({ subscriberSPDs: subscriberSPDs });
        // const penaltyData = await this.penaltyService.getPenaltyData();
        // const depositData = await this.depositService.getDepositData();

        return {
            // penalty: penaltyData,
            debt: debtData,
            // deposit: depositData,
        };
    }
}
