import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { DebtEntity } from './debt.entity';
import { Debt } from './debt.model';

@Injectable()
export class DebtRepository {
    constructor(
        @InjectModel(Debt.name) private readonly debtModel: Model<Debt>
    ) { }
    async create(debt: DebtEntity) {
        const newDebt = new this.debtModel(debt);
        return newDebt.save();
    }
    async findById(_id: string) {
        return this.debtModel.findById(_id).exec();
    }
    async findBySPDId(singlePaymentDocumentId: number) {
        return this.debtModel.findOne({ singlePaymentDocumentId }).exec();
    }
    async findMany(ids: string[]) {
        const objectIds = ids.map(id => new Types.ObjectId(id));
        return this.debtModel.find({ _id: { $in: objectIds } }).exec();
    }
    async delete(_id: string) {
        this.debtModel.deleteOne({ _id }).exec();
    }
    async update({ _id, ...rest }: DebtEntity) {
        return this.debtModel.updateOne({ _id }, { $set: { ...rest } }).exec();
    }
}
