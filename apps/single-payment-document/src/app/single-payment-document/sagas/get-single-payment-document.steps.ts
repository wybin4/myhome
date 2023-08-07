import { GetSinglePaymentDocumentSagaState } from "./get-single-payment-document.state";
import { SinglePaymentDocumentEntity } from "../single-payment-document.entity";
import { RMQException } from "@myhome/constants";
import { HttpStatus } from "@nestjs/common";
import { CalculationState } from "@myhome/interfaces";
import { GetCommonHouseNeeds, GetPublicUtilities } from "@myhome/contracts";


export class GetSinglePaymentDocumentSagaStateStarted extends GetSinglePaymentDocumentSagaState {
    public async calculateDetails(subscriberIds: number[], managementCompanyId?: number, houseId?: number): Promise<{ detailIds: number[]; singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        const { publicUtilities } = await this.saga.rmqService.send
            <
                GetPublicUtilities.Request,
                GetPublicUtilities.Response
            >(GetPublicUtilities.topic, {
                subscriberIds: subscriberIds,
                managementCompanyId: managementCompanyId
            });
        const { commonHouseNeeds } = await this.saga.rmqService.send
            <
                GetCommonHouseNeeds.Request,
                GetCommonHouseNeeds.Response
            >(GetCommonHouseNeeds.topic, {
                subscriberIds: subscriberIds,
                houseId: houseId
            });
        // где-то тут надо создать запись в бд single-payment-doc и добавить туда общие суммы из publicUtilities
        const detailIds = [];
        detailIds.push(publicUtilities.map(obj => obj.id));
        detailIds.push(commonHouseNeeds.map(obj => obj.id));
        this.saga.setState(CalculationState.DetailsCalculated);
        return { detailIds, singlePaymentDocument: this.saga.singlePaymentDocument }

    }
    public async calculateDebtAndPenalty(): Promise<{ singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new RMQException("Невозможно рассчитать задолженность и пени без деталей ЕПД", HttpStatus.BAD_REQUEST);
    }
    public async cancell(): Promise<{ singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        this.saga.setState(CalculationState.Cancelled);
        return { singlePaymentDocument: this.saga.singlePaymentDocument };
    }
    // public async pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    //     const { course } = await this.saga.rmqService.send<CourseGetCourse.Request, CourseGetCourse.Response>(CourseGetCourse.topic, {
    //         id: this.saga.courseId
    //     });
    //     if (!course) {
    //         throw new Error('Такого курса не существует');
    //     }
    //     if (course.price == 0) {
    //         this.saga.setState(PurchaseState.Purchased, course._id);
    //         return { paymentLink: null, user: this.saga.user }
    //     }
    //     const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
    //         sum: course.price,
    //         courseId: course._id,
    //         userId: this.saga.user._id
    //     });
    //     this.saga.setState(PurchaseState.WaitingForPayment, course._id);
    //     return { paymentLink, user: this.saga.user }
    // }
    // public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus; }> {
    //     throw new Error("Нельзя проверить платеж, который не начался");
    // }
    // public async cancell(): Promise<{ user: UserEntity; }> {
    //     this.saga.setState(PurchaseState.Cancelled, this.saga.courseId);
    //     return { user: this.saga.user };
    // }
}

export class GetSinglePaymentDocumentSagaStateDetailsCalculated extends GetSinglePaymentDocumentSagaState {
    public calculateDetails(): Promise<{ detailIds: number[]; singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new RMQException("ЕПД уже в процессе расчёта", HttpStatus.BAD_REQUEST);
    }
    public calculateDebtAndPenalty(): Promise<{ singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new Error("Пока нет расчёта задолженности и пени");
    }
    public cancell(): Promise<{ singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new RMQException("Нельзя отменить расчёт в процессе", HttpStatus.BAD_REQUEST);
    }
}

export class GetSinglePaymentDocumentSagaStateDebtAndPenaltiesCalculated extends GetSinglePaymentDocumentSagaState {
    public calculateDetails(): Promise<{ detailIds: number[]; singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new RMQException("Нельзя сделать перерасчёт уже рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
    public calculateDebtAndPenalty(): Promise<{ singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new RMQException("Нельзя сделать перерасчёт уже рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
    public cancell(): Promise<{ singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new RMQException("Нельзя отменить расчёт рассчитанного ЕПД", HttpStatus.BAD_REQUEST);
    }
}
export class GetSinglePaymentDocumentSagaStateCancelled extends GetSinglePaymentDocumentSagaState {
    public calculateDetails(subscriberIds: number[], managementCompanyId?: number, houseId?: number): Promise<{ detailIds: number[]; singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        this.saga.setState(CalculationState.Started);
        return this.saga.getState().calculateDetails(subscriberIds, managementCompanyId, houseId);
    }
    public calculateDebtAndPenalty(): Promise<{ singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new RMQException("Нельзя рассчитать отменённый ЕПД", HttpStatus.BAD_REQUEST);
    }
    public cancell(): Promise<{ singlePaymentDocument: SinglePaymentDocumentEntity; }> {
        throw new RMQException("Нельзя отменить отменённый ЕПД", HttpStatus.BAD_REQUEST);
    }
}
