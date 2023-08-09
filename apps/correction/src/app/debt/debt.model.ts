import { IDebt, IDebtDetail } from '@myhome/interfaces';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class DebtDetail extends Document implements IDebtDetail {
    @Prop({ required: true })
    penaltyRuleId: string;

    @Prop({ required: true })
    amount: number;
}

export const DebtDetailSchema = SchemaFactory.createForClass(DebtDetail);

@Schema()
export class Debt extends Document implements IDebt {
    @Prop({ required: true })
    singlePaymentDocumentId: number;

    @Prop({ type: [DebtDetailSchema] })
    outstandingDebt: IDebtDetail[];

    @Prop({ type: [DebtDetailSchema] })
    originalDebt: IDebtDetail[];

    @Prop({ required: true })
    createdAt: Date;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);