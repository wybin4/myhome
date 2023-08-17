import { IPenaltyCalculationRule, IPenaltyRule, IPenaltyRuleDetail } from '@myhome/interfaces';

export class PenaltyRuleEntity implements IPenaltyRule {
    _id?: string;
    description: string;
    penaltyRule: IPenaltyRuleDetail[];
    penaltyCalculationRules: IPenaltyCalculationRule[];

    constructor(penaltyRule: IPenaltyRule) {
        this._id = penaltyRule._id;
        this.description = penaltyRule.description;
        this.penaltyRule = penaltyRule.penaltyRule;
        this.penaltyCalculationRules = penaltyRule.penaltyCalculationRules;
    }

    public async addCalculationRule(rule: IPenaltyCalculationRule) {
        const calcRule = this.penaltyCalculationRules.find(obj => obj.managementCompanyId === rule.managementCompanyId);
        if (!calcRule) {
            this.penaltyCalculationRules.push(rule);
        } else {
            calcRule.typeOfServiceIds.push(...rule.typeOfServiceIds);
        }
        return this;
    }
}