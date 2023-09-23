import { RMQException } from "../../exception";
import { RMQService } from 'nestjs-rmq';
import { ReferenceGetSubscriber } from '@myhome/contracts';
import { SUBSCRIBER_NOT_EXIST } from "../../errors/subscriber.errors";

export async function getSubscriber(rmqService: RMQService, id: number) {
    try {
        return await rmqService.send<ReferenceGetSubscriber.Request, ReferenceGetSubscriber.Response>
            (ReferenceGetSubscriber.topic, { id: id });
    } catch (e) {
        throw new RMQException(SUBSCRIBER_NOT_EXIST.message(id), SUBSCRIBER_NOT_EXIST.status);
    }
}