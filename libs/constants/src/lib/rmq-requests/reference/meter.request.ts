/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReferenceAddMeter, ReferenceGetIndividualMeterReadings, ReferenceGetMeterReadingsByHID, ReferenceGetMeters, ReferenceUpdateMeter } from "@myhome/contracts";
import { MeterType } from "@myhome/interfaces";
import { RMQService } from "nestjs-rmq";
import { RMQException } from "../../exception";

export async function addMeter(rmqService: RMQService, dto: ReferenceAddMeter.Request) {
    try {
        return await rmqService.send
            <
                ReferenceAddMeter.Request,
                ReferenceAddMeter.Response
            >
            (ReferenceAddMeter.topic, dto);
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function updateMeter(rmqService: RMQService, dto: ReferenceUpdateMeter.Request) {
    try {
        return await rmqService.send
            <
                ReferenceUpdateMeter.Request,
                ReferenceUpdateMeter.Response
            >
            (ReferenceUpdateMeter.topic, dto);
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getMeters(rmqService: RMQService, meterIds: number[], meterType: MeterType) {
    try {
        return await rmqService.send
            <
                ReferenceGetMeters.Request,
                ReferenceGetMeters.Response
            >
            (ReferenceGetMeters.topic, { ids: meterIds, meterType: meterType });
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getMeter(rmqService: RMQService, id: number, meterType: MeterType) {
    const { meters } = await getMeters(rmqService, [id], meterType);
    if (!meters) return;
    return { meter: meters[0] };
}

export async function getMeterReadingsByHID(rmqService: RMQService, houseId: number, managementCompanyId: number) {
    try {
        return await rmqService.send
            <
                ReferenceGetMeterReadingsByHID.Request,
                ReferenceGetMeterReadingsByHID.Response
            >
            (
                ReferenceGetMeterReadingsByHID.topic, { houseId, managementCompanyId }
            );
    } catch (e: any) {
        throw new RMQException(e.message, e.code);
    }
}

export async function getIndividualMeterReadingsByHId(rmqService: RMQService, houseId: number, managementCompanyId: number) {
    try {
        return await rmqService.send
            <
                ReferenceGetIndividualMeterReadings.Request,
                ReferenceGetIndividualMeterReadings.Response
            >
            (
                ReferenceGetIndividualMeterReadings.topic, { houseId, managementCompanyId }
            );
    } catch (e: any) {
        throw new RMQException(e.message, e.code);
    }
}
