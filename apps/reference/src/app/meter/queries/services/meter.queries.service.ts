import { RMQException, INCORRECT_METER_TYPE, checkUser, METERS_NOT_EXIST } from "@myhome/constants";
import { MeterType, IIndividualMeter, UserRole, IMeter, IMeterReading, IGeneralMeter, IHouse } from "@myhome/interfaces";
import { Injectable, HttpStatus } from "@nestjs/common";
import { CommonService } from "../../../common/services/common.service";
import { ApartmentService } from "../../../subscriber/services/apartment.service";
import { GeneralMeterEntity } from "../../entities/general-meter.entity";
import { IndividualMeterEntity } from "../../entities/individual-meter.entity";
import { GeneralMeterRepository } from "../../repositories/general-meter.repository";
import { IndividualMeterRepository } from "../../repositories/individual-meter.repository";
import { MeterReadingQueriesService } from "./meter-reading.queries.service";
import { ReferenceGetApartmentsByMCId, ReferenceGetMeters, ReferenceGetMetersByMCId, ReferenceGetMetersBySID } from "@myhome/contracts";
import { HouseService } from "../../../subscriber/services/house.service";
import { RMQService } from "nestjs-rmq";
import { TypeOfServiceService } from "../../../common/services/type-of-service.service";


export type Meters = IndividualMeterEntity | GeneralMeterEntity;

@Injectable()
export class MeterQueriesService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly meterReadingQueriesService: MeterReadingQueriesService,
        private readonly commonService: CommonService,
        private readonly apartmentService: ApartmentService,
        private readonly houseService: HouseService,
        private readonly typeOfServiceService: TypeOfServiceService,
    ) { }

    public async getMetersBySID(subscriberIds: number[]): Promise<ReferenceGetMetersBySID.Response> {
        const { apartments } = await this.apartmentService.getApartmentsAllInfo(subscriberIds);
        const apartmentIds = apartments.map(a => a.id);

        const meters = await this.meterReadingQueriesService.getMeterReadings(
            MeterType.Individual, 15, 25, undefined, apartmentIds
        ); // ИСПРАВИТЬ

        const { typesOfService, units } = await this.commonService.getCommon();

        return {
            meters: apartments.map(apartment => {
                const currentMeters = meters.filter(meter => (meter.meter as IIndividualMeter).apartmentId === apartment.id);
                return {
                    apartmentId: apartment.id,
                    apartmentNumber: apartment.apartmentNumber,
                    apartmentFullAddress: apartment.address,
                    meters: currentMeters.map(meter => {
                        const currentTypeOfService = typesOfService.find(obj => obj.id === meter.meter.typeOfServiceId);
                        const currentUnit = units.find(obj => obj.id === currentTypeOfService.unitId);

                        return {
                            id: meter.meter.id,
                            typeOfServiceId: meter.meter.typeOfServiceId,
                            factoryNumber: meter.meter.factoryNumber,
                            verifiedAt: meter.meter.verifiedAt,
                            issuedAt: meter.meter.issuedAt,
                            typeOfServiceName: currentTypeOfService.name,
                            unitName: currentUnit.name,
                            readings: {
                                current: meter.reading.current ? meter.reading.current.reading : 0,
                                previous: meter.reading.previous ? meter.reading.previous.reading : 0,
                                previousReadAt: meter.reading.previous ? meter.reading.previous.readAt : undefined
                            }
                        };
                    })
                }
            })
        };
    }

    public async getMeters(ids: number[], meterType: MeterType): Promise<ReferenceGetMeters.Response> {
        switch (meterType) {
            case (MeterType.General): {
                const meters = await this.individualMeterRepository.findByIdsWithTOS(ids);
                if (!meters) {
                    throw new RMQException(METERS_NOT_EXIST.message, METERS_NOT_EXIST.status);
                }
                const newMeters = meters.map(m => new IndividualMeterEntity(m));
                return {
                    meters: newMeters
                };
            };
            case (MeterType.Individual): {
                const meters = await this.generalMeterRepository.findByIdsWithTOS(ids);
                if (!meters) {
                    throw new RMQException(METERS_NOT_EXIST.message, METERS_NOT_EXIST.status);
                }
                const newMeters = meters.map(m => new GeneralMeterEntity(m));
                return {
                    meters: newMeters
                };
            }
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }

    public async getMetersByMCId(managementCompanyId: number, meterType: MeterType):
        Promise<ReferenceGetMetersByMCId.Response> {
        await checkUser(this.rmqService, managementCompanyId, UserRole.ManagementCompany);
        let houses: IHouse[]; let apartments: ReferenceGetApartmentsByMCId.Response; let houseIds: number[]; let apartmentIds: number[];
        let meters: {
            meter: IMeter;
            reading: {
                previous: IMeterReading;
                current: IMeterReading;
            };
        }[] = [];

        const { typesOfService } = await this.typeOfServiceService.getAll();

        switch (meterType) {
            case (MeterType.General):
                ({ houses } = await this.houseService.getHousesByMCId(managementCompanyId));
                houseIds = houses.map(obj => obj.id);

                meters = await this.meterReadingQueriesService.getMeterReadings(
                    MeterType.General, 15, 25, houseIds, undefined
                ); // ИСПРАВИТЬ

                return {
                    meters: meters.map(meter => {
                        const currentTypeOfService = typesOfService.find(obj => obj.id === meter.meter.typeOfServiceId);
                        const currentHouse = houses.find(obj => obj.id === (meter.meter as IGeneralMeter).houseId);
                        const currentReading = meter.reading.current;
                        const previousReading = meter.reading.current;

                        return {
                            ...meter.meter,
                            houseName: `${currentHouse.city}, ${currentHouse.street}`,
                            typeOfServiceName: currentTypeOfService.name,
                            currentReading: currentReading ? currentReading.reading : 0,
                            previousReading: previousReading ? previousReading.reading : 0,
                            currentReadAt: currentReading ? currentReading.readAt : undefined,
                            previousReadAt: previousReading ? previousReading.readAt : undefined,
                        };
                    })
                };
            case (MeterType.Individual):
                apartments = await this.apartmentService.getApartmentsByMCId(managementCompanyId);
                apartmentIds = apartments.apartments.map(obj => obj.id);

                meters = await this.meterReadingQueriesService.getMeterReadings(
                    MeterType.Individual, 15, 25, undefined, apartmentIds
                ); // ИСПРАВИТЬ

                return {
                    meters: meters.map(meter => {
                        const currentTypeOfService = typesOfService.find(obj => obj.id === meter.meter.typeOfServiceId);
                        const currentApartment = apartments.apartments.find(obj => obj.id === (meter.meter as IIndividualMeter).apartmentId);
                        const currentReading = meter.reading.current;
                        const previousReading = meter.reading.current;

                        return {
                            ...meter.meter,
                            houseName: currentApartment.houseName,
                            typeOfServiceName: currentTypeOfService.name,
                            currentReading: currentReading ? currentReading.reading : 0,
                            previousReading: previousReading ? previousReading.reading : 0,
                            currentReadAt: currentReading ? currentReading.readAt : undefined,
                            previousReadAt: previousReading ? previousReading.readAt : undefined,
                        };
                    })
                };
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }
}