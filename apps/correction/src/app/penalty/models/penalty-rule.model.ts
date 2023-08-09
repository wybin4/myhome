import { IPenaltyCalculationRule, IPenaltyRule, IPenaltyRuleDetail } from '@myhome/interfaces';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class PenaltyRuleDetail extends Document implements IPenaltyRuleDetail {
    @Prop({ required: true })
    divider: number;

    @Prop({ required: true })
    designation: string;

    @Prop({ required: true })
    start: number;

    @Prop({ required: false })
    end: number;
}

export const PenaltyRuleDetailSchema = SchemaFactory.createForClass(PenaltyRuleDetail);

@Schema()
export class PenaltyCalculationRule extends Document implements IPenaltyCalculationRule {
    @Prop({ required: true })
    typeOfServiceIds: number[];

    @Prop({ required: true })
    managementCompanyId: number;

    @Prop({ required: true })
    priority: number;
}

export const PenaltyCalculationRuleSchema = SchemaFactory.createForClass(PenaltyCalculationRule);

@Schema()
export class PenaltyRule extends Document implements IPenaltyRule {
    @Prop({ required: true, type: String, maxlength: 500 })
    description: string;

    @Prop({ type: [PenaltyRuleDetailSchema] })
    penaltyRule: PenaltyRuleDetail[];

    @Prop({ type: [PenaltyCalculationRuleSchema] })
    penaltyCalculationRules: IPenaltyCalculationRule[];
}

export const PenaltyRuleSchema = SchemaFactory.createForClass(PenaltyRule);