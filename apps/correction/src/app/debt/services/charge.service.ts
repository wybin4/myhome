import { Injectable } from "@nestjs/common";
import { CorrectionGetCharges, IGetSinglePaymentDocumentsBySId, GetSinglePaymentDocumentsByUser, CorrectionGetChargeChart } from "@myhome/contracts";
import { DebtRepository } from "../repositories/debt.repository";
import { AmountChange, IDebtForCharge, IDebtSpdRelationGroup, IDebtSpdRelationItem, IGetChargeChart, IMeta, UserRole } from "@myhome/interfaces";
import { CANT_GET_DEBT_BY_THIS_SPD_ID, RMQException } from "@myhome/constants";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ChargeService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly debtRepository: DebtRepository
    ) { }

    private createSpdGroupedByApartmentList(spds: IGetSinglePaymentDocumentsBySId[]) {
        const apartmentIdToSpdListMap = new Map();
        spds.forEach(spd => {
            const apartmentId = spd.apartmentId;
            if (!apartmentIdToSpdListMap.has(apartmentId)) {
                apartmentIdToSpdListMap.set(apartmentId, []);
            }
            const spdList = apartmentIdToSpdListMap.get(apartmentId);
            spdList.push(spd);
        });

        apartmentIdToSpdListMap.forEach(spdList => {
            spdList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });

        return Array.from(apartmentIdToSpdListMap, ([apartmentId, spdList]) => ({
            apartmentId,
            spdList
        }));
    }

    private createSpdDebtRelationGroupedByApartmentList(spds: IGetSinglePaymentDocumentsBySId[], debts: IDebtForCharge[]) {
        const spdGroupedByApartmentList = this.createSpdGroupedByApartmentList(spds);
        const spdDebtRelationGroupedList: IDebtSpdRelationGroup[] = [];

        spdGroupedByApartmentList.forEach(spdGroupedByApartment => {
            const apartmentId = spdGroupedByApartment.apartmentId;
            const spdList = spdGroupedByApartment.spdList;
            const spdDebtRelationList: IDebtSpdRelationItem[] = [];

            let prevDebtSum = 0;

            spdList.forEach(spd => {
                const currDebt = debts.find(debt => debt.singlePaymentDocumentId === spd.id);
                if (currDebt) {
                    const currDebtSum = currDebt.originalDebt.map(od => od.amount).reduce((a, b) => a + b, 0)
                    const amountChange = this.calculateAmountChange(currDebtSum, prevDebtSum);
                    const percent = this.calculatePercent(currDebtSum, prevDebtSum);

                    const spdDebtRelationListItem: IDebtSpdRelationItem = {
                        spdId: spd.id,
                        percent,
                        createdAt: spd.createdAt,
                        amountChange,
                        originalDebt: currDebtSum,
                        outstandingDebt: currDebt.outstandingDebt.map(od => od.amount).reduce((a, b) => a + b, 0)
                    };
                    spdDebtRelationList.push(spdDebtRelationListItem);

                    prevDebtSum = currDebtSum;
                } else {
                    throw new RMQException(CANT_GET_DEBT_BY_THIS_SPD_ID.message(spd.id), CANT_GET_DEBT_BY_THIS_SPD_ID.status);
                }
            });

            spdDebtRelationGroupedList.push({
                apartmentId,
                spdDebtRelationList
            });
        });

        return spdDebtRelationGroupedList;
    }

    private chargeListToUi(spds: IGetSinglePaymentDocumentsBySId[], debts: IDebtForCharge[]) {
        const spdDebtRelationGroupedByApartmentList = this.createSpdDebtRelationGroupedByApartmentList(spds, debts);
        const sortedByDescendingSpdList = spds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const chargeUiModels = [];

        sortedByDescendingSpdList.forEach(spd => {
            const spdDebtRelations = spdDebtRelationGroupedByApartmentList.flatMap(item => item.spdDebtRelationList)
                .filter(relation => relation.spdId === spd.id);

            if (spdDebtRelations.length > 0) {
                const spdDebtRelation = spdDebtRelations[0];

                const chargeUiModel = {
                    id: spd.id,
                    apartmentName: spd.apartmentName,
                    mcName: spd.mcName,
                    mcCheckingAccount: spd.mcCheckingAccount,
                    createdAt: spd.createdAt,
                    percent: spdDebtRelation.percent,
                    amountChange: spdDebtRelation.amountChange,
                    outstandingDebt: spdDebtRelation.outstandingDebt,
                    originalDebt: spdDebtRelation.originalDebt
                };
                chargeUiModels.push(chargeUiModel);
            } else {
                throw new RMQException(CANT_GET_DEBT_BY_THIS_SPD_ID.message(spd.id), CANT_GET_DEBT_BY_THIS_SPD_ID.status);
            }
        });
        return chargeUiModels;
    }

    private calculateAmountChange(currDebt: number, prevDebt: number) {
        if (prevDebt !== 0) {
            const debtDiff = currDebt - prevDebt;
            if (debtDiff > 0) return AmountChange.Positive;
            else if (debtDiff < 0) return AmountChange.Negative;
            else return AmountChange.None;
        } else {
            return AmountChange.None; // если нет предыдущего долга
        }
    }

    private calculatePercent(currDebt: number, prevDebt: number) {
        if (prevDebt !== 0) {
            const debtDiff = (currDebt || 0) - prevDebt;
            if (prevDebt !== 0) return (debtDiff / prevDebt) * 100; // вычисляем процент
            else return 0; // если нет предыдущего долга, процент равен нулю
        } else {
            return 0; // если нет предыдущего долга, процент равен нулю
        }
    }

    public async getCharges(dto: CorrectionGetCharges.Request): Promise<CorrectionGetCharges.Response> {
        const { singlePaymentDocuments, totalCount } = await this.getSPDsByOwner(dto.userId, dto.meta);
        if (!singlePaymentDocuments && !singlePaymentDocuments.length) {
            return { charges: [], totalCount: 0 };
        }
        const spdIds = singlePaymentDocuments.map(s => s.id);
        const debts = await this.debtRepository.findSPDsWithOutstandingDebtAndOriginalDebt(spdIds);

        return {
            charges: this.chargeListToUi(singlePaymentDocuments as IGetSinglePaymentDocumentsBySId[], debts),
            totalCount
        };
    }

    public async getChargeChart(dto: CorrectionGetChargeChart.Request): Promise<CorrectionGetChargeChart.Response> {
        const { singlePaymentDocuments } = await this.getSPDsByOwner(dto.userId, { limit: dto.count, page: 1 });
        if (!singlePaymentDocuments && !singlePaymentDocuments.length) {
            return { charges: [] };
        }
        const spdIds = singlePaymentDocuments.map(s => s.id);
        const debts = await this.debtRepository.findSPDsWithOutstandingDebtAndOriginalDebt(spdIds);

        const sortedByDescendingSpdList = singlePaymentDocuments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const charges: IGetChargeChart[] = [];

        sortedByDescendingSpdList.forEach(spd => {
            const currDebt = debts.find(debt => debt.singlePaymentDocumentId === spd.id);
            if (currDebt) {
                charges.push({
                    id: spd.id,
                    amount: currDebt.originalDebt.map(od => od.amount).reduce((a, b) => a + b, 0),
                    apartmentId: spd.apartmentId,
                    apartmentName: spd.apartmentName,
                    createdAt: spd.createdAt,
                });
            } else {
                throw new RMQException(CANT_GET_DEBT_BY_THIS_SPD_ID.message(spd.id), CANT_GET_DEBT_BY_THIS_SPD_ID.status);
            }
        });
        return { charges };
    }

    private async getSPDsByOwner(userId: number, meta: IMeta) {
        try {
            return await this.rmqService.send<
                GetSinglePaymentDocumentsByUser.Request,
                GetSinglePaymentDocumentsByUser.Response
            >(GetSinglePaymentDocumentsByUser.topic, {
                userId, userRole: UserRole.Owner,
                isNotAllInfo: false, meta
            });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

}