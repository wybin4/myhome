import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { GetCommonHouseNeeds } from "@myhome/contracts";
import { getHouseByMCId, FAILED_TO_GET_INDIVIDUAL_READINGS, RMQException, getApartmentsBySubscribers, getMeterReadingsByHID, getAllTypesOfService, getAllTariffs, TARIFFS_NOT_EXIST } from "@myhome/constants";
import { PublicUtilityService } from "../public-utility/public-utility.service";
import { ICommonHouseNeedTariff, IGetCommonHouseNeed, IGetDocumentDetail, IGetMeterData, Reading, TariffAndNormType } from "@myhome/interfaces";

@Injectable()
export class CommonHouseNeedService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly publicUtilityService: PublicUtilityService
    ) { }

    public async getCommonHouseNeed(
        { subscriberIds, houseId }: GetCommonHouseNeeds.Request
    ): Promise<GetCommonHouseNeeds.Response> {
        const { house } = await getHouseByMCId(this.rmqService, houseId);
        const managementCompanyId = house.managementCompanyId;

        const individualAmountConsumed = await this.getPUSum(houseId, managementCompanyId);
        const { meterReadings: generalMeterReadings } = await getMeterReadingsByHID(this.rmqService, houseId, managementCompanyId);

        const difference: { difference: number; typeOfServiceId: number; meterData: Reading; }[] = [];
        const result: IGetCommonHouseNeed[] = [];

        for (const chn of generalMeterReadings) {
            const currentIndividual = individualAmountConsumed.find(obj => obj.typeOfServiceId === chn.typeOfServiceId);
            if (!currentIndividual) {
                throw new RMQException(FAILED_TO_GET_INDIVIDUAL_READINGS.message, FAILED_TO_GET_INDIVIDUAL_READINGS.status);
            }
            difference.push({
                difference: chn.meterReadings.reading - currentIndividual.count,
                typeOfServiceId: chn.typeOfServiceId,
                meterData: chn.fullMeterReadings
            });
        }

        const { apartments } = await getApartmentsBySubscribers(this.rmqService, subscriberIds);

        const { tariffs } = await this.getCommonHouseNeedTariffs(managementCompanyId);
        if (!tariffs || !tariffs.length) {
            throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
        
        for (const apartmentEntity of apartments) {
            const temp: IGetDocumentDetail[] = [];
            const meterData: IGetMeterData[] = [];

            for (const diff of difference) {
                const currentTariff = tariffs.find((obj) => obj.typeOfServiceId === diff.typeOfServiceId);
                temp.push({
                    amountConsumed: diff.difference * apartmentEntity.livingArea / house.livingArea,
                    typeOfServiceId: diff.typeOfServiceId,
                    tariff: currentTariff.multiplier
                });
                meterData.push({
                    typeOfServiceId: diff.typeOfServiceId,
                    fullMeterReadings: diff.meterData,
                });
            }
            result.push({
                subscriberId: apartmentEntity.subscriber.id,
                commonHouseNeeds: temp,
                meterData: meterData
            });
        }

        return { commonHouseNeeds: result };
    }

    private async getPUSum(houseId: number, managementCompanyId: number) {
        const { publicUtilities } = await this.publicUtilityService.getPublicUtilityByHId(houseId, managementCompanyId);
        const { typesOfService } = await getAllTypesOfService(this.rmqService);
        const typesOfServiceId = typesOfService.map(obj => obj.id);
        const amountConsumed = [];
        for (const tos of typesOfServiceId) {
            let temp: {
                tariff: number,
                amountConsumed: number,
                typeOfServiceId: number
            };
            let sum = 0;
            for (const pu of publicUtilities) {
                temp = pu.publicUtility.find((obj) => obj.typeOfServiceId === tos);
                if (temp) { sum += temp.amountConsumed; }
            }
            if (sum > 0) {
                amountConsumed.push({
                    count: sum,
                    typeOfServiceId: tos
                });
            }
        }
        return amountConsumed;
    }

    private async getCommonHouseNeedTariffs(managementCompanyId: number) {
        const { tariffs } = await getAllTariffs(
            this.rmqService,
            managementCompanyId,
            TariffAndNormType.CommonHouseNeedTariff
        );
        return { tariffs: tariffs as ICommonHouseNeedTariff[] };
    }
}