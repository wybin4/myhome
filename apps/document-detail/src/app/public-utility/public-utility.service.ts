import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { IMunicipalTariff, ISubscriber, MeterType, TariffAndNormType } from "@myhome/interfaces";
import { GetDocumentDetail, IGetMeterReadingBySID, ReferenceGetAllTariffs, ReferenceGetMeterReadingBySID, ReferenceGetSubscriber } from "@myhome/contracts";
import { CANT_GET_SUBSCRIBER_WITH_ID, RMQException, SUBSCRIBER_NOT_EXIST, TARIFFS_NOT_EXIST } from "@myhome/constants";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { DocumentDetailRepository } from "../document-detail/document-detail.repository";
@Injectable()
export class PublicUtilityService {
    constructor(
        private readonly documentDetailRepository: DocumentDetailRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async getPublicUtility({ subscriberIds, managementCompanyId }: GetDocumentDetail.Request) {
        const result = [];
        let meterReadings: ReferenceGetMeterReadingBySID.Response;
        let tariffs: Array<IMunicipalTariff>;
        try {
            tariffs = await this.getPublicUtilityTariffs(managementCompanyId) as unknown as Array<IMunicipalTariff>;
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
        for (const subscriberId of subscriberIds) {
            const subscriber = await this.getSubscriber(subscriberId);
            if (!subscriber) {
                throw new RMQError(CANT_GET_SUBSCRIBER_WITH_ID + subscriberId, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
            }
            try {
                meterReadings = await this.getMeterReadingsBySID(subscriber.subscriber, managementCompanyId);
            } catch (e) {
                throw new RMQException(e.message, e.status);
            }
            result.push({
                subscriberId: subscriberId,
                publicUtility: await this.getPUAmount(meterReadings.meterReadings, tariffs)
            })
        }
        return result;
    }

    private async getSubscriber(subscriberId: number) {
        try {
            return await this.rmqService.send<ReferenceGetSubscriber.Request, ReferenceGetSubscriber.Response>(
                ReferenceGetSubscriber.topic, { id: subscriberId }
            );
        } catch (e) {
            throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
    }

    private async getMeterReadingsBySID(subscriber: ISubscriber, managementCompanyId: number): Promise<ReferenceGetMeterReadingBySID.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetMeterReadingBySID.Request,
                    ReferenceGetMeterReadingBySID.Response
                >
                (
                    ReferenceGetMeterReadingBySID.topic, { subscriber: subscriber, meterType: MeterType.Individual, managementCompanyId }
                );
        } catch (e) {
            throw new RMQException(e.message, e.code);
        }
    }

    private async getPublicUtilityTariffs(managementCompanyId: number) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetAllTariffs.Request,
                    ReferenceGetAllTariffs.Response
                >
                (
                    ReferenceGetAllTariffs.topic,
                    { managementCompanyId: managementCompanyId, type: TariffAndNormType.MunicipalTariff }
                );
        } catch (e) {
            throw new RMQError(TARIFFS_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
    }

    private async getPUAmount(meterReadings: IGetMeterReadingBySID[], tariffs: Array<IMunicipalTariff>) {
        const temp = [];
        for (const meterReading of meterReadings) {
            const difference = meterReading.meterReadings.reading;
            const currentTariff = tariffs.filter((obj) => obj.typeOfServiceId === meterReading.typeOfSeriveId);
            if (currentTariff[0]) {
                temp.push({
                    tariff:
                        currentTariff[0].multiplyingFactor
                            ?
                            currentTariff[0].norm * currentTariff[0].multiplyingFactor
                            :
                            currentTariff[0].norm,
                    amountConsumed: difference,
                    typeOfServiceId: meterReading.typeOfSeriveId
                });
            } else throw new RMQError(TARIFFS_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        return temp;
    }

}