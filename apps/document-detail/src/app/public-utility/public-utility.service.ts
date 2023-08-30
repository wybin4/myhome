import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { IGetMeterReading, IMunicipalTariff, ISubscriber, MeterType, TariffAndNormType } from "@myhome/interfaces";
import { GetPublicUtilities, ReferenceGetAllTariffs, ReferenceGetMeterReadingBySID, ReferenceGetSubscriber } from "@myhome/contracts";
import { RMQException, SUBSCRIBER_WITH_ID_NOT_EXIST, TARIFFS_NOT_EXIST } from "@myhome/constants";

@Injectable()
export class PublicUtilityService {
    constructor(
        private readonly rmqService: RMQService,
    ) { }

    public async getPublicUtility(
        { subscriberIds, managementCompanyId }: GetPublicUtilities.Request
    ): Promise<GetPublicUtilities.Response> {
        const result = [];
        let meterReadings: ReferenceGetMeterReadingBySID.Response;
        let tariffs: Array<IMunicipalTariff>;
        try {
            tariffs = await this.getPublicUtilityTariffs(managementCompanyId) as unknown as Array<IMunicipalTariff>;
        }
        catch (e) {
            throw new RMQException(e.message, e.code);
        }
        for (const subscriberId of subscriberIds) {
            const subscriber = await this.getSubscriber(subscriberId);
            if (!subscriber) {
                throw new RMQException(SUBSCRIBER_WITH_ID_NOT_EXIST.message(subscriberId), SUBSCRIBER_WITH_ID_NOT_EXIST.status);
            }
            try {
                meterReadings = await this.getMeterReadingsBySID(subscriber.subscriber, managementCompanyId);
            } catch (e) {
                throw new RMQException(e.message, e.status);
            }
            result.push({
                subscriberId: subscriberId,
                publicUtility: await this.getPUAmount(meterReadings.meterReadings, tariffs),
                meterData: meterReadings.meterReadings.map(obj => {
                    return {
                        fullMeterReadings: obj.fullMeterReadings,
                        typeOfServiceId: obj.typeOfServiceId
                    };
                })
            })
        }
        return { publicUtilities: result };
    }

    private async getSubscriber(subscriberId: number) {
        try {
            return await this.rmqService.send<ReferenceGetSubscriber.Request, ReferenceGetSubscriber.Response>(
                ReferenceGetSubscriber.topic, { id: subscriberId }
            );
        } catch (e) {
            throw new RMQException(SUBSCRIBER_WITH_ID_NOT_EXIST.message(subscriberId), SUBSCRIBER_WITH_ID_NOT_EXIST.status);
        }
    }

    private async getMeterReadingsBySID(
        subscriber: ISubscriber, managementCompanyId: number
    ): Promise<ReferenceGetMeterReadingBySID.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetMeterReadingBySID.Request,
                    ReferenceGetMeterReadingBySID.Response
                >
                (
                    ReferenceGetMeterReadingBySID.topic,
                    {
                        subscriber: subscriber,
                        meterType: MeterType.Individual,
                        managementCompanyId
                    });
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
            throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
    }

    private async getPUAmount(meterReadings: IGetMeterReading[], tariffs: Array<IMunicipalTariff>) {
        const temp = [];
        for (const meterReading of meterReadings) {
            const difference = meterReading.meterReadings.reading;
            const currentTariff = tariffs.find((obj) => obj.typeOfServiceId === meterReading.typeOfServiceId);
            if (currentTariff) {
                temp.push({
                    tariff:
                        currentTariff.multiplyingFactor
                            ?
                            currentTariff.norm * currentTariff.multiplyingFactor
                            :
                            currentTariff.norm,
                    amountConsumed: difference,
                    typeOfServiceId: meterReading.typeOfServiceId,
                    unitId: currentTariff.unitId
                });
            } else throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
        return temp;
    }

}