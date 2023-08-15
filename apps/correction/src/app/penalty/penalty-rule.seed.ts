import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PenaltyRule } from "./models/penalty-rule.model";

@Injectable()
export class PenaltyRuleSeeder {
    constructor(
        @InjectModel(PenaltyRule.name)
        private readonly penaltyRuleModel: Model<PenaltyRule>,
    ) { }

    public async checkDataExistence(): Promise<boolean> {
        try {
            const count = await this.penaltyRuleModel.estimatedDocumentCount();
            return count > 0;
        } catch (error) {
            Logger.error("Error checking data existence:", error);
            return false;
        }
    }

    public async seed() {
        const data = [
            {
                "description": "Без настроек",
                "penaltyRule": []
            },
            {
                "description": "C 31 дня просрочки 1/300 ставки; С 91 дня 1/130 ставки",
                "penaltyRule": [
                    {
                        "divider": 0,
                        "designation": "0",
                        "start": 1,
                        "end": 30
                    },
                    {
                        "divider": 300,
                        "designation": "1/300",
                        "start": 31,
                        "end": 90
                    },
                    {
                        "divider": 130,
                        "designation": "1/130",
                        "start": 91,
                        "end": 1095
                    }
                ]
            },
            {
                "description": "С 1 дня просрочки 1/300 ставки",
                "penaltyRule": [
                    {
                        "divider": 300,
                        "designation": "1/300",
                        "start": 1,
                        "end": 1095
                    }
                ]
            }
        ];

        for (const item of data) {
            const penaltyRule = new this.penaltyRuleModel({
                description: item.description,
                penaltyRule: item.penaltyRule,
            });
            await penaltyRule.save();
        }
    }
}
