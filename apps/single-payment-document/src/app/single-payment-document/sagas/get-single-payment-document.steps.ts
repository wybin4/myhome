import { GetSinglePaymentDocumentSagaState } from "./get-single-payment-document.state";
import { SinglePaymentDocumentEntity } from "../single-payment-document.entity";
import { RMQException } from "@myhome/constants";
import { HttpStatus } from "@nestjs/common";
import { CalculationState } from "@myhome/interfaces";
import { GetCommonHouseNeeds, GetPublicUtilities } from "@myhome/contracts";


export class GetSinglePaymentDocumentSagaStateStarted extends GetSinglePaymentDocumentSagaState {

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
        for (const pu of publicUtilities) {
            const chn = commonHouseNeeds.find(obj => obj.subscriberId === pu.subscriberId);

            const chnResult = chn.commonHouseNeeds.map(obj => obj.tariff * obj.commonHouseNeed);
            const puResult = pu.publicUtility.map(obj => obj.tariff * obj.publicUtility);

            const temp = chnResult.reduce((a, b) => a + b, 0) + puResult.reduce((a, b) => a + b, 0);
            sum.push({
                sum: temp,
                subscriberId: pu.subscriberId
            });
        }

        console.log(sum);

        // когда будет добавление в базу и в респонсе появится id
        const detailIds = [];
        // detailIds.push(publicUtilities.map(obj => obj.id));
        // detailIds.push(commonHouseNeeds.map(obj => obj.id));

        this.saga.setState(CalculationState.DetailsCalculated);
        this.saga.singlePaymentDocuments.map(spd => {
            const currSum = sum.find(s => spd.subscriberId === s.subscriberId);
            spd.setAmount(currSum.sum);
        });

        console.log(this.saga.singlePaymentDocuments)
        
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
    public calculateDebtAndPenalty(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
        throw new Error("Пока нет расчёта задолженности и пени");
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
    public calculateDetails(subscriberIds: number[], managementCompanyId?: number, houseId?: number): Promise<{ detailIds: number[]; singlePaymentDocuments: SinglePaymentDocumentEntity[]; }> {
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
