/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAddMeter, ReferenceAddMeters, ReferenceGetIndividualMeterReadings, ReferenceGetMeterReadingsByHID, ReferenceGetMeters, ReferenceUpdateMeter } from "@myhome/contracts";
import { MeterType } from "@myhome/interfaces";
import { RMQService } from "nestjs-rmq";
import { RMQException } from "../../exception";
import { HttpStatus } from "@nestjs/common";

export async function addMeter(rmqService: RMQService, dto: IAddMeter & { meterType: MeterType }) {
    try {
        const { meterType, ...rest } = dto;
        const { meters } = await rmqService.send
            <
                ReferenceAddMeters.Request,
                ReferenceAddMeters.Response
            >
            (ReferenceAddMeters.topic, { meters: [rest], meterType });
        if (!meters || meters.length === 0) {
            throw new RMQException('Невозможно добавить счётчик', HttpStatus.BAD_REQUEST);
        } else {
            return meters[0];
        }

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
