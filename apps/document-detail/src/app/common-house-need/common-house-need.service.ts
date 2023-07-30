import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { ISubscriber, MeterType } from "@myhome/interfaces";
import { ReferenceGetMeterReadingBySID, ReferenceGetSubscriber } from "@myhome/contracts";
import { FAILED_TO_GET_METER_READINGS, SUBSCRIBER_NOT_EXIST } from "@myhome/constants";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
@Injectable()
export class CommonHouseNeedService {
    // constructor(
    //     private readonly documentDetailRepository: DocumentDetailRepository,
    //     private readonly rmqService: RMQService,
    // ) { }

    // public async getCommonHouseNeed(subscriberIds: number[]) {
    //     for (const subscriberId of subscriberIds) {
    //         const subscriber = await this.getSubscriber(subscriberId);
    //         const meterReadings = await this.getMeterReadingsBySID(subscriber);
    //     }

    // }

    // private async getSubscriber(subscriberId: number): Promise<ISubscriber> {
    //     let requestSubscriber: ReferenceGetSubscriber.Request, responseSubscriber: ReferenceGetSubscriber.Response;
    //     try {
    //         requestSubscriber = { id: subscriberId };
    //         responseSubscriber = await this.rmqService.send<ReferenceGetSubscriber.Request, ReferenceGetSubscriber.Response>(
    //             ReferenceGetSubscriber.topic,
    //             requestSubscriber,
    //         );
    //     } catch (e) {
    //         throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
    //     }

    //     return responseSubscriber.subscriber;
    // }

    // private async getMeterReadingsBySID(subscriber: ISubscriber) {
    //     let requestMR: ReferenceGetMeterReadingBySID.Request, responseMR: ReferenceGetMeterReadingBySID.Response;
    //     try {
    //         requestMR = { subscriber: subscriber, meterType: MeterType.Individual };
    //         responseMR = await this.rmqService.send<ReferenceGetMeterReadingBySID.Request, ReferenceGetMeterReadingBySID.Response>(
    //             ReferenceGetSubscriber.topic,
    //             requestMR,
    //         );
    //     } catch (e) {
    //         throw new RMQError(FAILED_TO_GET_METER_READINGS, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
    //     }

    //     return responseMR.meterReadings;
    // }

}