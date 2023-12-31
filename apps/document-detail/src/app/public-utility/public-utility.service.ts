import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { IGetMeterReading, IGetPublicUtility, IMunicipalTariff, TariffAndNormType } from "@myhome/interfaces";
import { GetPublicUtilities, ReferenceGetIndividualMeterReadings } from "@myhome/contracts";
import { RMQException, TARIFFS_NOT_EXIST, getIndividualMeterReadingsByHId, getAllTariffs } from "@myhome/constants";

@Injectable()
export class PublicUtilityService {
    constructor(
        private readonly rmqService: RMQService,
    ) { }

    public async getPublicUtilityByHId(
        houseId: number, managementCompanyId: number
    ): Promise<{ publicUtilities: IGetPublicUtility[] }> {
        const result: IGetPublicUtility[] = [];
        const { meterReadings } = await getIndividualMeterReadingsByHId(this.rmqService, houseId, managementCompanyId);
        const { tariffs } = await this.getPublicUtilityTariffs(managementCompanyId);
        if (!tariffs || !tariffs.length) {
            throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
        }

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

    public async getPublicUtility(
        { subscriberIds, managementCompanyId }: GetPublicUtilities.Request
    ): Promise<GetPublicUtilities.Response> {
        const result: IGetPublicUtility[] = [];
        const { meterReadings } = await this.getIndividualMeterReadingsBySIds(subscriberIds, managementCompanyId);
        const { tariffs } = await this.getPublicUtilityTariffs(managementCompanyId);
        if (!tariffs || !tariffs.length) {
            throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
        }

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

    private async getIndividualMeterReadingsBySIds(
        subscriberIds: number[], managementCompanyId: number
    ): Promise<ReferenceGetIndividualMeterReadings.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetIndividualMeterReadings.Request,
                    ReferenceGetIndividualMeterReadings.Response
                >
                (
                    ReferenceGetIndividualMeterReadings.topic,
                    {
                        subscriberIds,
                        managementCompanyId
                    });
        } catch (e) {
            throw new RMQException(e.message, e.code);
        }
    }

    private async getPublicUtilityTariffs(managementCompanyId: number) {
        const { tariffAndNorms } = await getAllTariffs(this.rmqService, managementCompanyId, TariffAndNormType.MunicipalTariff);
        return { tariffs: tariffAndNorms as IMunicipalTariff[] };
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