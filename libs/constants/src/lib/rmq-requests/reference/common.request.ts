/* eslint-disable @typescript-eslint/no-explicit-any */
import { RMQException } from "../../exception";
import { RMQService } from 'nestjs-rmq';
import { ReferenceGetAllTypesOfService, ReferenceGetCommon, ReferenceGetTypesOfService } from '@myhome/contracts';

export async function getCommon(rmqService: RMQService): Promise<ReferenceGetCommon.Response> {
    try {
        return await rmqService.send
            <
                ReferenceGetCommon.Request,
                ReferenceGetCommon.Response
            >
            (ReferenceGetCommon.topic, {});
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getTypeOfService(rmqService: RMQService, typeOfServiceId: number) {
    const { typesOfService } = await getTypesOfService(rmqService, [typeOfServiceId]);
    if (!typesOfService.length) return;
    return { typeOfService: typesOfService[0] };
}

export async function getTypesOfService(rmqService: RMQService, typeOfServiceIds: number[]) {
    try {
        return await rmqService.send
            <
                ReferenceGetTypesOfService.Request,
                ReferenceGetTypesOfService.Response
            >
            (ReferenceGetTypesOfService.topic, { typeOfServiceIds });
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}

export async function getAllTypesOfService(rmqService: RMQService) {
    try {
        return await rmqService.send<
            ReferenceGetAllTypesOfService.Request,
            ReferenceGetAllTypesOfService.Response
        >(
            ReferenceGetAllTypesOfService.topic, new ReferenceGetAllTypesOfService.Request()
        );
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}