import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { IGetMeterReading, IGetPublicUtility, IMunicipalTariff, TariffAndNormType } from "@myhome/interfaces";
import { GetPublicUtilities, ReferenceGetAllTariffs, ReferenceGetMeterReadingBySID, ReferenceGetSubscribers } from "@myhome/contracts";
import { RMQException, SUBSCRIBERS_NOT_EXIST, TARIFFS_NOT_EXIST } from "@myhome/constants";

@Injectable()
export class PublicUtilityService {
    constructor(
        private readonly rmqService: RMQService,
    ) { }

    public async getPublicUtility(
        { subscriberIds, managementCompanyId }: GetPublicUtilities.Request
    ): Promise<GetPublicUtilities.Response> {
        const result: IGetPublicUtility[] = [];
        const { meterReadings } = await this.getMeterReadingsBySID(subscriberIds, managementCompanyId);
        const tariffs = await this.getPublicUtilityTariffs(managementCompanyId) as unknown as Array<IMunicipalTariff>;

        for (const meterReading of meterReadings) {
            result.push({
                subscriberId: meterReading.subscriberId,
                publicUtility: await this.getPUAmount(meterReading.data, tariffs),
                meterData: meterReading.data.map(obj => {
                    return {
                        fullMeterReadings: obj.fullMeterReadings,
                        typeOfServiceId: obj.typeOfServiceId
                    };
                })
            });
        }
        return { publicUtilities: result };
    }

    private async getSubscribers(subscriberIds: number[]) {
        try {
            return await this.rmqService.send<ReferenceGetSubscribers.Request, ReferenceGetSubscribers.Response>(
                ReferenceGetSubscribers.topic, { ids: subscriberIds }
            );
        } catch (e) {
            throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
        }
    }

    private async getMeterReadingsBySID(
        subscriberIds: number[], managementCompanyId: number
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
                        subscriberIds: subscriberIds,
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
                });
            } else throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
        return temp;
    }

}