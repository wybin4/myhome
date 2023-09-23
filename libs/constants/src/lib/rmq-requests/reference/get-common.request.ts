import { RMQException } from "../../exception";
import { RMQService } from 'nestjs-rmq';
import { ReferenceGetCommon } from '@myhome/contracts';

export async function getCommon(rmqService: RMQService): Promise<ReferenceGetCommon.Response> {
    try {
        return await rmqService.send
            <
                ReferenceGetCommon.Request,
                ReferenceGetCommon.Response
            >
            (ReferenceGetCommon.topic, {});
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        throw new RMQException(e.message, e.status);
    }
}