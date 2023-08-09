import { IPenaltyRule, IPenaltyRuleDetail } from '@myhome/interfaces';
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
export class PenaltyRule extends Document implements IPenaltyRule {
    @Prop({ required: true, type: String, maxlength: 500 })
    description: string;

    @Prop({ type: [PenaltyRuleDetailSchema] })
    penaltyRule: PenaltyRuleDetail[];
}

export const PenaltyRuleSchema = SchemaFactory.createForClass(PenaltyRule);