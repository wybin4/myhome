import { RMQException } from "../../exception";
import { RMQService } from 'nestjs-rmq';
import { ReferenceGetApartment } from '@myhome/contracts';
import { APART_NOT_EXIST } from "../../errors/subscriber.errors";

export async function checkApartment(rmqService: RMQService, id: number) {
    try {
        await rmqService.send<ReferenceGetApartment.Request, ReferenceGetApartment.Response>
            (ReferenceGetApartment.topic, { id: id });
    } catch (e) {
        throw new RMQException(APART_NOT_EXIST.message(id), APART_NOT_EXIST.status);
    }
}