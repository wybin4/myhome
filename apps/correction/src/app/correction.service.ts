import { Injectable } from "@nestjs/common";
import { DebtService } from "./debt/services/debt.service";
import { PenaltyService } from "./debt/services/penalty.service";
import { DepositService } from "./deposit/deposit.service";
import { GetCorrection } from "@myhome/contracts";

@Injectable()
export class CorrectionService {
    constructor(
        private readonly penaltyService: PenaltyService,
        private readonly debtService: DebtService,
        private readonly depositService: DepositService,
    ) { }

    async getCorrection({ subscriberSPDs }: GetCorrection.Request) {
        const debtData = await this.debtService.calculateDebts({ subscriberSPDs: subscriberSPDs });
        const penaltyData = await this.penaltyService.calculatePenalties({ subscriberSPDs: subscriberSPDs });
        // const depositData = await this.depositService.getDepositData();

        return {
            penalty: penaltyData,
            debt: debtData,
            // deposit: depositData,
        };
    }
}
