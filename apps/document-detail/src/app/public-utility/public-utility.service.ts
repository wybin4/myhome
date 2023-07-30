import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { ISubscriber, MeterType } from "@myhome/interfaces";
import { ReferenceGetMeterReadingBySID, ReferenceGetSubscriber } from "@myhome/contracts";
import { CANT_GET_SUBSCRIBER, FAILED_TO_GET_METER_READINGS, SUBSCRIBER_NOT_EXIST } from "@myhome/constants";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { DocumentDetailRepository } from "../document-detail/document-detail.repository";
@Injectable()
export class PublicUtilityService {
    constructor(
        private readonly documentDetailRepository: DocumentDetailRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async getPublicUtility(subscriberIds: number[]) {
        for (const subscriberId of subscriberIds) {
            const subscriber = await this.getSubscriber(subscriberId);
            if (!subscriber) {
                throw new RMQError(CANT_GET_SUBSCRIBER, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
            }
            const meterReadings = await this.getMeterReadingsBySID(subscriber as unknown as ISubscriber);
            console.log(meterReadings)
        }
    }

    private async getSubscriber(subscriberId: number) {
        try {
            return await this.rmqService.send<ReferenceGetSubscriber.Request, ReferenceGetSubscriber.Response>(
                ReferenceGetSubscriber.topic, { id: subscriberId }
            );
        } catch (e) {
            throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
    }

    private async getMeterReadingsBySID(subscriber: ISubscriber) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetMeterReadingBySID.Request,
                    ReferenceGetMeterReadingBySID.Response
                >
                (
                    ReferenceGetMeterReadingBySID.topic, { subscriber: subscriber, meterType: MeterType.Individual }
                );
        } catch (e) {
            throw new RMQError(FAILED_TO_GET_METER_READINGS, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
    }

}