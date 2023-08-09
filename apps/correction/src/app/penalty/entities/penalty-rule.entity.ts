import { IPenaltyRule, IPenaltyRuleDetail } from '@myhome/interfaces';

export class PenaltyRuleEntity implements IPenaltyRule {
    _id?: string;
    description: string;
    penaltyRule: IPenaltyRuleDetail[];

    constructor(penaltyRule: IPenaltyRule) {
        this._id = penaltyRule._id;
        this.description = penaltyRule.description;
        this.penaltyRule = penaltyRule.penaltyRule;
    }
}
