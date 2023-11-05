/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGetSubscribersByMCId, ISubscriberAllInfo, ReferenceGetOwnersByMCId, ReferenceGetReceiversByOwner, ReferenceGetSubscribers, ReferenceGetSubscribersByUser } from "@myhome/contracts";
import { RMQException } from "../../exception";
import { RMQService } from 'nestjs-rmq';
import { ISubscriber, UserRole } from "@myhome/interfaces";

export async function getSubscriber(rmqService: RMQService, id: number) {
    try {
        const { subscribers } = await rmqService.send<ReferenceGetSubscribers.Request, ReferenceGetSubscribers.Response>
            (ReferenceGetSubscribers.topic, { ids: [id], isAllInfo: false });
        if (!subscribers.length) return;
        return { subscriber: subscribers[0] as ISubscriber };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getSubscribersAllInfo(rmqService: RMQService, subscriberIds: number[]) {
    try {
        const { subscribers } = await rmqService.send
            <
                ReferenceGetSubscribers.Request,
                ReferenceGetSubscribers.Response
            >
            (ReferenceGetSubscribers.topic, { ids: subscriberIds, isAllInfo: true })
        return { subscribers: subscribers as ISubscriberAllInfo[] }
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getSubscribersByOId(rmqService: RMQService, ownerId: number) {
    try {
        const { subscribers } = await rmqService.send
            <
                ReferenceGetSubscribersByUser.Request,
                ReferenceGetSubscribersByUser.Response
            >
            (ReferenceGetSubscribersByUser.topic, { userId: ownerId, userRole: UserRole.Owner });
        return { subscribers: subscribers as ISubscriber[] };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getSubscribersByMCId(rmqService: RMQService, managementCompanyId: number) {
    try {
        const { subscribers } = await rmqService.send
            <
                ReferenceGetSubscribersByUser.Request,
                ReferenceGetSubscribersByUser.Response
            >
            (ReferenceGetSubscribersByUser.topic, { userId: managementCompanyId, userRole: UserRole.ManagementCompany });
        return { subscribers: subscribers as IGetSubscribersByMCId[] };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getReceiversByOwner(rmqService: RMQService, ownerId: number) {
    try {
        return await rmqService.send
            <
                ReferenceGetReceiversByOwner.Request,
                ReferenceGetReceiversByOwner.Response
            >
            (ReferenceGetReceiversByOwner.topic, { ownerId });
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getOwnerIdsByMCId(rmqService: RMQService, managementCompanyId: number) {
    try {
        return await rmqService.send
            <
                ReferenceGetOwnersByMCId.Request,
                ReferenceGetOwnersByMCId.Response
            >
            (ReferenceGetOwnersByMCId.topic, { managementCompanyId });
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}