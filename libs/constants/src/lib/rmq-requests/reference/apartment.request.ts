/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGetApartmentAllInfo, IGetApartmentsWithSubscriber, ReferenceGetApartments, ReferenceGetApartmentsBySubscribers } from "@myhome/contracts";
import { RMQException } from "../../exception";
import { RMQService } from 'nestjs-rmq';

export async function getApartmentsAllInfo(rmqService: RMQService, subscriberIds: number[]) {
    try {
        const { apartments } = await rmqService.send<
            ReferenceGetApartmentsBySubscribers.Request,
            ReferenceGetApartmentsBySubscribers.Response
        >(ReferenceGetApartmentsBySubscribers.topic,
            { subscriberIds, isAllInfo: true });
        return { apartments: apartments as IGetApartmentAllInfo[] };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getApartment(rmqService: RMQService, id: number) {
    try {
        const { apartments } = await rmqService.send<
            ReferenceGetApartments.Request,
            ReferenceGetApartments.Response
        >(ReferenceGetApartments.topic, { ids: [id] });
        if (!apartments.length) return;
        return { apartment: apartments[0] };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getApartmentsBySubscribers(rmqService: RMQService, subscriberIds: number[]) {
    try {
        const { apartments } = await rmqService.send<
            ReferenceGetApartmentsBySubscribers.Request,
            ReferenceGetApartmentsBySubscribers.Response
        >(ReferenceGetApartmentsBySubscribers.topic, { subscriberIds, isAllInfo: false });
        return { apartments: apartments as IGetApartmentsWithSubscriber[] };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}