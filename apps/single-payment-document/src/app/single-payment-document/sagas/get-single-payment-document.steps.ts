import { GetSinglePaymentDocumentSagaState } from "./get-single-payment-document.state";
import { SinglePaymentDocumentEntity } from "../single-payment-document.entity";
import { CANT_ADD_DOCUMENT_DETAILS, RMQException } from "@myhome/constants";
import { HttpStatus } from "@nestjs/common";
import { CalculationState, IDocumentDetail } from "@myhome/interfaces";
import { AddDocumentDetails, GetCommonHouseNeeds, GetPublicUtilities } from "@myhome/contracts";


export class GetSinglePaymentDocumentSagaStateStarted extends GetSinglePaymentDocumentSagaState {

    public async addDocumentDetails(details: IDocumentDetail[]) {
        try {
            return await this.saga.rmqService.send
                <
                    AddDocumentDetails.Request,
                    AddDocumentDetails.Response
                >
                (AddDocumentDetails.topic, { details: details });
        } catch (e) {
            throw new RMQException(CANT_ADD_DOCUMENT_DETAILS.message, CANT_ADD_DOCUMENT_DETAILS.status);
        }
    }

    private async getPublicUtility(subscriberIds: number[], managementCompanyId: number) {
        return await this.saga.rmqService.send
            <
                GetPublicUtilities.Request,
                GetPublicUtilities.Response
            >(GetPublicUtilities.topic, {
                subscriberIds: subscriberIds,
                managementCompanyId: managementCompanyId
            });
    }

    private async getCommonHouseNeed(subscriberIds: number[], houseId: number) {
        return await this.saga.rmqService.send
            <
                GetCommonHouseNeeds.Request,
                GetCommonHouseNeeds.Response
            >(GetCommonHouseNeeds.topic, {
                subscriberIds: subscriberIds,
                houseId: houseId
            });
    }

    public async calculateDetails(subscriberIds: number[], managementCompanyId?: number, houseId?: number): Promise<{ detailIds: number[]; singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        const { publicUtilities } = await this.getPublicUtility(subscriberIds, managementCompanyId);
        const { commonHouseNeeds } = await this.getCommonHouseNeed(subscriberIds, houseId);

        const sum: { sum: number, subscriberId: number }[] = [];
        const details: IDocumentDetail[] = [];

        for (const pu of publicUtilities) {
            const chn = commonHouseNeeds.find(obj => obj.subscriberId === pu.subscriberId);
            // По id юзера ищем нужные ЕПД
            const spd = this.saga.singlePaymentDocuments.find(obj => obj.subscriberId === pu.subscriberId);

            // Пушим для добавления в базу, обогащая каждый объект spdId
            details.push(...chn.commonHouseNeeds.map(obj => {
                return {
                    singlePaymentDocumentId: spd.id,
                    ...obj
                }
            }));
            details.push(...pu.publicUtility.map(obj => {
                return {
                    singlePaymentDocumentId: spd.id,
                    ...obj
                }
            }));

            const chnResult = chn.commonHouseNeeds.map(obj => obj.tariff * obj.amountConsumed);
            const puResult = pu.publicUtility.map(obj => obj.tariff * obj.amountConsumed);

            const temp = chnResult.reduce((a, b) => a + b, 0) + puResult.reduce((a, b) => a + b, 0);
            sum.push({
                sum: temp,
                subscriberId: pu.subscriberId
            });
        }

        this.saga.setState(CalculationState.DetailsCalculated);
        this.saga.singlePaymentDocuments.map(spd => {
            const currSum = sum.find(s => spd.subscriberId === s.subscriberId);
            spd.setAmount(currSum.sum);
        });

        // Добавляем details в базу и на выход получаем detailIds
        let detailIds: number[];
        try {
            detailIds = (await this.addDocumentDetails(details)).detailIds;
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }

        return { detailIds, singlePaymentDocuments: this.saga.singlePaymentDocuments }
    }

    public async calculateDebtAndPenalty(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Невозможно рассчитать задолженность и пени без деталей ЕПД", HttpStatus.BAD_REQUEST);
    }

    public async cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        this.saga.setState(CalculationState.Cancelled);
        return { singlePaymentDocuments: this.saga.singlePaymentDocuments };
    }
}

export class GetSinglePaymentDocumentSagaStateDetailsCalculated extends GetSinglePaymentDocumentSagaState {
    public calculateDetails(): Promise<{ detailIds: number[]; singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("ЕПД уже в процессе расчёта", HttpStatus.BAD_REQUEST);
    }
    public calculateDebtAndPenalty(detailIds: number[]): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        console.log(detailIds);
        return;
    }
    public cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя отменить расчёт в процессе", HttpStatus.BAD_REQUEST);
    }
}

export class GetSinglePaymentDocumentSagaStateDebtAndPenaltiesCalculated extends GetSinglePaymentDocumentSagaState {
    public calculateDetails(): Promise<{ detailIds: number[]; singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя сделать перерасчёт уже рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
    public calculateDebtAndPenalty(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя сделать перерасчёт уже рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
    public cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя отменить расчёт рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
}
export class GetSinglePaymentDocumentSagaStateCancelled extends GetSinglePaymentDocumentSagaState {
    public async calculateDetails(subscriberIds: number[], managementCompanyId?: number, houseId?: number): Promise<{ detailIds: number[]; singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        this.saga.setState(CalculationState.Started);
        return this.saga.getState().calculateDetails(subscriberIds, managementCompanyId, houseId);
    }
    public calculateDebtAndPenalty(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя рассчитать отменённый ЕПД", HttpStatus.BAD_REQUEST);
    }
    public cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new RMQException("Нельзя отменить отменённый ЕПД", HttpStatus.BAD_REQUEST);
    }
}
