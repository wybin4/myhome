import { TypeOrmModule } from "@nestjs/typeorm";
import { GeneralMeterReadingEntity } from "./entities/general-meter-reading.entity";
import { GeneralMeterEntity } from "./entities/general-meter.entity";
import { IndividualMeterReadingEntity } from "./entities/individual-meter-reading.entity";
import { IndividualMeterEntity } from "./entities/individual-meter.entity";
import { GeneralMeterReadingRepository } from "./repositories/general-meter-reading.repository";
import { IndividualMeterReadingRepository } from "./repositories/individual-meter-reading.repository";
import { IndividualMeterRepository } from "./repositories/individual-meter.repository";
import { Module } from "@nestjs/common";
import { MeterService } from "./services/meter.service";
import { MeterController } from "./controllers/meter.controller";
import { MeterReadingController } from "./controllers/meter-reading.controller";
import { MeterReadingService } from "./services/meter-reading.service";
import { GeneralMeterRepository } from "./repositories/general-meter.repository";
import { SubscriberModule } from "../subscriber/subscriber.module";
import { MeterEventEmitter } from "./meter.event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { CommonModule } from "../common/common.module";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([
            IndividualMeterEntity, GeneralMeterEntity,
            IndividualMeterReadingEntity, GeneralMeterReadingEntity
        ]),
        SubscriberModule,
        CommonModule
    ],
    providers: [
        IndividualMeterRepository, GeneralMeterRepository,
        IndividualMeterReadingRepository, GeneralMeterReadingRepository,
        MeterService, MeterReadingService,
        MeterEventEmitter
    ],
    exports: [
        IndividualMeterRepository, GeneralMeterRepository,
        IndividualMeterReadingRepository, GeneralMeterReadingRepository,
    ],
    controllers: [MeterController, MeterReadingController],
})
export class MeterModule { }