import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { GetCommonHouseNeeds, ReferenceGetAllTariffs, ReferenceGetAllTypesOfService, ReferenceGetApartmentsBySubscribers, ReferenceGetHouse, ReferenceGetMeterReadingByHID } from "@myhome/contracts";
import { FAILED_TO_GET_INDIVIDUAL_READINGS, HOUSE_NOT_EXIST, RMQException, TARIFFS_NOT_EXIST } from "@myhome/constants";
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
        const house = await this.getManagementCID(houseId);
        const managementCompanyId = house.house.managementCompanyId;

        const individualAmountConsumed = await this.getPUSum(houseId, managementCompanyId);
        const { meterReadings: generalMeterReadings } = await this.getMeterReadingsByHID(houseId, managementCompanyId);

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

        const apartmentEntities = await this.getApartmentsBySubscribers(subscriberIds);

        let tariffs: Array<ICommonHouseNeedTariff>;
        try {
            tariffs = await this.getCommonHouseNeedTariffs(managementCompanyId) as unknown as Array<ICommonHouseNeedTariff>;
        }
        catch (e) {
            throw new RMQException(e.message, e.code);
        }

        for (const apartmentEntity of apartmentEntities.apartments) {
            const temp: IGetDocumentDetail[] = [];
            const meterData: IGetMeterData[] = [];

            for (const diff of difference) {
                const currentTariff = tariffs.find((obj) => obj.typeOfServiceId === diff.typeOfServiceId);
                temp.push({
                    amountConsumed: diff.difference * apartmentEntity.livingArea / house.house.livingArea,
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

    private async getCommonHouseNeedTariffs(houseId: number) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetAllTariffs.Request,
                    ReferenceGetAllTariffs.Response
                >
                (
                    ReferenceGetAllTariffs.topic,
                    { houseId: houseId, type: TariffAndNormType.CommonHouseNeedTariff }
                );
        } catch (e) {
            throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
    }

    private async getApartmentsBySubscribers(subscriberIds: number[]): Promise<ReferenceGetApartmentsBySubscribers.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetApartmentsBySubscribers.Request,
                    ReferenceGetApartmentsBySubscribers.Response
                >
                (
                    ReferenceGetApartmentsBySubscribers.topic, { subscriberIds }
                );
        } catch (e) {
            throw new RMQException(e.message, e.code);
        }
    }

    private async getMeterReadingsByHID(houseId: number, managementCompanyId: number): Promise<ReferenceGetMeterReadingByHID.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetMeterReadingByHID.Request,
                    ReferenceGetMeterReadingByHID.Response
                >
                (
                    ReferenceGetMeterReadingByHID.topic, { houseId, managementCompanyId }
                );
        } catch (e) {
            throw new RMQException(e.message, e.code);
        }
    }

    private async getManagementCID(houseId: number) {
        try {
            return await this.rmqService.send<ReferenceGetHouse.Request, ReferenceGetHouse.Response>(
                ReferenceGetHouse.topic, { id: houseId }
            );
        } catch (e) {
            throw new RMQException(HOUSE_NOT_EXIST.message(houseId), HOUSE_NOT_EXIST.status);
        }
    }

    private async getAllTypesOfService() {
        try {
            return await this.rmqService.send<ReferenceGetAllTypesOfService.Request, ReferenceGetAllTypesOfService.Response>(
                ReferenceGetAllTypesOfService.topic, new ReferenceGetAllTypesOfService.Request()
            );
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getPUSum(houseId: number, managementCompanyId: number) {
        const { publicUtilities } = await this.publicUtilityService.getPublicUtilityByHId(houseId, managementCompanyId);
        const typesOfService = (await this.getAllTypesOfService()).typesOfService.map(obj => obj.id);
        const amountConsumed = [];
        for (const tos of typesOfService) {
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
}