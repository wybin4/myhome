import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { DebtEntity } from '../entities/debt.entity';
import { Debt } from '../models/debt.model';
import { ObjectId } from 'typeorm';
import { IDebtDetail, IDebtHistory } from '@myhome/interfaces';

@Injectable()
export class DebtRepository {
    constructor(
        @InjectModel(Debt.name) private readonly debtModel: Model<Debt>
    ) { }
    async create(debt: DebtEntity) {
        const newDebt = new this.debtModel(debt);
        return await newDebt.save();
    }
    async findById(_id: string) {
        return await this.debtModel.findById(_id).exec();
    }
    async findBySPDId(singlePaymentDocumentId: number): Promise<Debt> {
        return await this.debtModel.findOne({ singlePaymentDocumentId }).exec();
    }
    async findMany(ids: string[]): Promise<Debt[]> {
        const objectIds = ids.map(id => new Types.ObjectId(id));
        return await this.debtModel.find({ _id: { $in: objectIds } }).exec();
    }
    async delete(_id: string) {
        await this.debtModel.deleteOne({ _id }).exec();
    }
    async update({ _id, ...rest }: DebtEntity) {
        return await this.debtModel.updateOne({ _id }, { $set: { ...rest } }).exec();
    }
    async findSPDsWithOutstandingDebt(spdIds: number[]): Promise<{ singlePaymentDocumentId: ObjectId, outstandingDebt: IDebtDetail[] }[]> {
        return await this.debtModel.aggregate([
            {
                $match: {
                    singlePaymentDocumentId: { $in: spdIds },
                    'debtHistory.0.outstandingDebt': {
                        $elemMatch: {
                            'amount': { $ne: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    singlePaymentDocumentId: '$singlePaymentDocumentId',
                    outstandingDebt: {
                        $arrayElemAt: ['$debtHistory.outstandingDebt', 0]
                    },
                },
            },
        ]).exec();
    }

    async findSPDsWithDebtHistory(spdIds: number[]): Promise<{ singlePaymentDocumentId: ObjectId, debtHistory: IDebtHistory[] }[]> {
        return await this.debtModel.aggregate([
            {
                $match: {
                    singlePaymentDocumentId: { $in: spdIds },
                    'debtHistory.0.outstandingDebt': {
                        $elemMatch: {
                            'amount': { $ne: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    singlePaymentDocumentId: '$singlePaymentDocumentId',
                    debtHistory: '$debtHistory'
                },
            },
        ]).exec();
    }

    async findSPDsWithNonZeroPenalty(spdIds: number[]): Promise<{ singlePaymentDocumentId: ObjectId, outstandingPenalty: number }[]> {
        return await this.debtModel.aggregate([
            {
                $match: {
                    singlePaymentDocumentId: { $in: spdIds },
                    'debtHistory.': {
                        $elemMatch: {
                            'outstandingPenalty': { $ne: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    singlePaymentDocumentId: '$singlePaymentDocumentId',
                    outstandingPenalty: {
                        $arrayElemAt: ['$debtHistory.outstandingPenalty', 0]
                    },
                },
            },
        ]).exec();
    }
}
