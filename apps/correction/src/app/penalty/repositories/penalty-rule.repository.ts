import { InjectModel } from '@nestjs/mongoose';
import { PenaltyRuleEntity } from '../entities/penalty-rule.entity';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PenaltyRule } from '../models/penalty-rule.model';

@Injectable()
export class PenaltyRuleRepository {
    constructor(
        @InjectModel(PenaltyRule.name) private readonly penaltyRuleModel: Model<PenaltyRule>
    ) { }
    async create(penaltyRule: PenaltyRuleEntity) {
        const newPenaltyRule = new this.penaltyRuleModel(penaltyRule);
        return newPenaltyRule.save();
    }
    async findById(_id: string) {
        return this.penaltyRuleModel.findById(_id).exec();
    }
    async delete(_id: string) {
        this.penaltyRuleModel.deleteOne({ _id }).exec();
    }
    async update({ _id, ...rest }: PenaltyRuleEntity) {
        return this.penaltyRuleModel.updateOne({ _id }, { $set: { ...rest } }).exec();
    }
}
