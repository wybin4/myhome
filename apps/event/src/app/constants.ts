import { RMQException } from "@myhome/constants";
import { ReferenceGetHouseAllInfo, ReferenceGetHousesByMCId, ReferenceGetHousesByOwner } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";

export async function getHousesByMCId(rmqService: RMQService, managementCompanyId: number) {
    try {
        return await rmqService.send
            <
                ReferenceGetHousesByMCId.Request,
                ReferenceGetHousesByMCId.Response
            >
            (ReferenceGetHousesByMCId.topic, { managementCompanyId });
    } catch (e) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getHouseByOId(rmqService: RMQService, ownerId: number) {
    try {
        return await rmqService.send
            <
                ReferenceGetHousesByOwner.Request,
                ReferenceGetHousesByOwner.Response
            >
            (ReferenceGetHousesByOwner.topic, { ownerId });
    } catch (e) {
        throw new RMQException(e.message, e.status);
    }
}


export async function getHouse(rmqService: RMQService, id: number) {
    try {
        return await rmqService.send<
            ReferenceGetHouseAllInfo.Request,
            ReferenceGetHouseAllInfo.Response>
            (ReferenceGetHouseAllInfo.topic, { id });
    } catch (e) {
        throw new RMQException(e.message, e.status);
    }
}