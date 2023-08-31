import { GetSinglePaymentDocumentSaga } from "./get-single-payment-document.saga";
import { SinglePaymentDocumentEntity } from "../single-payment-document.entity";
import { IGetCorrection, ITypeOfService, IUnit } from "@myhome/interfaces";
import { ISpdDetailInfo } from "../interfaces/single-payment-document.interface";
import { ISpdMeterReadings } from "../interfaces/reading-table.interface";

export abstract class GetSinglePaymentDocumentSagaState {
    public saga: GetSinglePaymentDocumentSaga;

    public setContext(saga: GetSinglePaymentDocumentSaga) {
        this.saga = saga;
    }

    public abstract calculateDetails(
        subscriberIds: number[],
        typesOfService: ITypeOfService[], units: IUnit[],
        managementCompanyId?: number, houseId?: number
    ): Promise<{
        detailIds: number[]; detailsInfo: ISpdDetailInfo[];
        meterReadingsData: ISpdMeterReadings[];
        singlePaymentDocuments: SinglePaymentDocumentEntity[];
    }>;
    public abstract calculateCorrection(
        subscriberSPDs: IGetCorrection[], keyRate?: number
    ): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[] }>;
    public abstract cancell(): Promise<{ singlePaymentDocuments: SinglePaymentDocumentEntity[] }>;
}