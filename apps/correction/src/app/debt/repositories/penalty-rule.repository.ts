import { InjectModel } from '@nestjs/mongoose';
import { PenaltyRuleEntity } from '../entities/penalty-rule.entity';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PenaltyRule } from '../models/penalty-rule.model';
import { IPenaltyRule } from '@myhome/interfaces';

@Injectable()
export class PenaltyRuleRepository {
    constructor(
        @InjectModel(PenaltyRule.name) private readonly penaltyRuleModel: Model<PenaltyRule>,
    ) { }
    async create(penaltyRule: PenaltyRuleEntity) {
        const newPenaltyRule = new this.penaltyRuleModel(penaltyRule);
        return await newPenaltyRule.save();
    }
    async findById(_id: string) {
        return await this.penaltyRuleModel.findById(_id).exec();
    }
    async delete(_id: string) {
        await this.penaltyRuleModel.deleteOne({ _id }).exec();
    }
    async update({ _id, ...rest }: PenaltyRuleEntity) {
        return await this.penaltyRuleModel.updateOne({ _id }, { $set: { ...rest } }).exec();
    }
    async findAll(): Promise<IPenaltyRule[]> {
        return await this.penaltyRuleModel.find().exec();
    }
    async findByManagementCIDAndPriority(
        managementCompanyId: number,
        priority: number,
    ): Promise<PenaltyRule | null> {
        return await this.penaltyRuleModel.findOne({
            'penaltyCalculationRules': {
                $elemMatch: {
                    managementCompanyId,
                    priority,
                },
            },
        }).exec();
    }
    async findByMCId(
        managementCompanyId: number,
    ): Promise<PenaltyRule[]> {
        return await this.penaltyRuleModel.aggregate([
            {
                $match: {
                    'penaltyCalculationRules.managementCompanyId': managementCompanyId,
                },
            }
        ]);
    }
}
