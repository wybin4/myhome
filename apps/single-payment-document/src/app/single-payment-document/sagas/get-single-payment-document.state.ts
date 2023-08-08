import { GetSinglePaymentDocumentSaga } from "./get-single-payment-document.saga";
import { SinglePaymentDocumentEntity } from "../single-payment-document.entity";

export abstract class GetSinglePaymentDocumentSagaState {
    public saga: GetSinglePaymentDocumentSaga;

    public setContext(saga: GetSinglePaymentDocumentSaga) {
        this.saga = saga;
    }

    public abstract calculateDetails(subscriberIds: number[], managementCompanyId?: number, houseId?: number): Promise<{ detailIds: number[], singlePaymentDocuments: SinglePaymentDocumentEntity[] }>;
    public abstract calculateDebtAndPenalty(detailIds: number[]): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[] }>;
    public abstract cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[] }>;
}