import { CheckSinglePaymentDocument } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CANT_GET_SPD } from '../../errors/single-payment-document.errors';
import { RMQException } from '../../exception';

export async function checkSPD(rmqService: RMQService, id: number) {
    try {
        await rmqService.send
            <
                CheckSinglePaymentDocument.Request,
                CheckSinglePaymentDocument.Response
            >
            (CheckSinglePaymentDocument.topic, { id: id });
    } catch (e) {
        throw new RMQException(CANT_GET_SPD.message(id), CANT_GET_SPD.status);
    }
}