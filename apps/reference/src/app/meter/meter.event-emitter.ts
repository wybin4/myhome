import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class MeterEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    // async handle(event: IDomainEvent) {
    //     await this.rmqService.notify(event.topic, event.data);
    // }
}
