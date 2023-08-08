import { Repository } from "typeorm";
import { PenaltyRuleEntity } from "./entities/penalty-rule.entity";

export async function seedPenaltyRule(penaltyRuleRepository: Repository<PenaltyRuleEntity>) {
    const data = [
        {
            description: 'Без настроек',
        },
        {
            description: 'C 31 дня просрочки 1/300 ставки; С 91 дня 1/130 ставки',
            penaltyRule: [
                {
                    divider: 0,
                    designation: '0',
                    start: 1,
                    end: 30,
                },
                {
                    divider: 300,
                    designation: '1/300',
                    start: 31,
                    end: 90,
                },
                {
                    divider: 130,
                    designation: '1/130',
                    start: 91,
                    end: null,
                },
            ]
        },
        {
            description: 'С 1 дня просрочки 1/300 ставки',
            penaltyRule: [
                {
                    divider: 300,
                    designation: '1/300',
                    start: 1,
                    end: null,
                },
            ]
        },
    ];

    for (const item of data) {
        const penaltyRuleEntity = new PenaltyRuleEntity();
        penaltyRuleEntity.description = item.description;
        penaltyRuleEntity.penaltyRule = JSON.stringify(item.penaltyRule);
        await penaltyRuleRepository.save(penaltyRuleEntity);
    }
}