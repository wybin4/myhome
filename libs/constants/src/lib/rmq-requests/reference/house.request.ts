/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGetHouseAllInfo, ReferenceGetHouses, ReferenceGetHousesByUser } from "@myhome/contracts";
import { IHouse, UserRole } from "@myhome/interfaces";
import { RMQService } from "nestjs-rmq";
import { RMQException } from "../../exception";

export async function getHousesByOId(rmqService: RMQService, ownerId: number) {
    try {
        return await rmqService.send
            <
                ReferenceGetHousesByUser.Request,
                ReferenceGetHousesByUser.Response
            >
            (ReferenceGetHousesByUser.topic, { userId: ownerId, userRole: UserRole.Owner, isAllInfo: false });
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getHousesByMCId(rmqService: RMQService, managementCompanyId: number) {
    try {
        return await rmqService.send
            <
                ReferenceGetHousesByUser.Request,
                ReferenceGetHousesByUser.Response
            >
            (ReferenceGetHousesByUser.topic, { userId: managementCompanyId, userRole: UserRole.ManagementCompany, isAllInfo: false });
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getHouseByOId(rmqService: RMQService, ownerId: number) {
    try {
        const { houses } = await getHousesByOId(rmqService, ownerId);
        if (!houses.length) return;
        return { house: houses[0] };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getHouseByMCId(rmqService: RMQService, managementCompanyId: number) {
    try {
        const { houses } = await getHousesByMCId(rmqService, managementCompanyId);
        if (!houses.length) return;
        return { house: houses[0] };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getHouseAllInfo(rmqService: RMQService, id: number) {
    try {
        const { houses } = await rmqService.send<
            ReferenceGetHouses.Request,
            ReferenceGetHouses.Response>
            (ReferenceGetHouses.topic, { houseIds: [id], isAllInfo: true });
        if (!houses.length) return;
        return { house: houses[0] as IGetHouseAllInfo };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getHouses(rmqService: RMQService, houseIds: number[]) {
    try {
        const { houses } = await rmqService.send<
            ReferenceGetHouses.Request,
            ReferenceGetHouses.Response>
            (ReferenceGetHouses.topic, { houseIds, isAllInfo: false });
        return { houses: houses as IHouse[] };
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}