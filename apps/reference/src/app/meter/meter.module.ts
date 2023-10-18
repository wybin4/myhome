import { TypeOrmModule } from "@nestjs/typeorm";
import { GeneralMeterReadingEntity } from "./entities/general-meter-reading.entity";
import { GeneralMeterEntity } from "./entities/general-meter.entity";
import { IndividualMeterReadingEntity } from "./entities/individual-meter-reading.entity";
import { IndividualMeterEntity } from "./entities/individual-meter.entity";
import { GeneralMeterReadingRepository } from "./repositories/general-meter-reading.repository";
import { IndividualMeterReadingRepository } from "./repositories/individual-meter-reading.repository";
import { IndividualMeterRepository } from "./repositories/individual-meter.repository";
import { Module } from "@nestjs/common";
import { GeneralMeterRepository } from "./repositories/general-meter.repository";
import { SubscriberModule } from "../subscriber/subscriber.module";
import { MeterEventEmitter } from "./meter.event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { CommonModule } from "../common/common.module";
import { TariffAndNormModule } from "../tariff-and-norm/tariff-and-norm.module";
import { MeterReadingCommandsService } from "./commands/services/meter-reading.commands.service";
import { MeterReadingCalculationsService } from "./queries/services/meter-reading.calculations.service";
import { MeterReadingQueries } from "./queries/controllers/meter-reading.queries";
import { MeterReadingCommands } from "./commands/controllers/meter-reading.commands";
import { MeterCommandsService } from "./commands/services/meter.commands.service";
import { MeterCommands } from "./commands/controllers/meter.commands";
import { MeterQueries } from "./queries/controllers/meter.queries";
import { MeterReadingQueriesService } from "./queries/services/meter-reading.queries.service";
import { MeterQueriesService } from "./queries/services/meter.queries.service";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([
            IndividualMeterEntity, GeneralMeterEntity,
            IndividualMeterReadingEntity, GeneralMeterReadingEntity
        ]),
        SubscriberModule,
        CommonModule,
        TariffAndNormModule
    ],
    providers: [
        IndividualMeterRepository, GeneralMeterRepository,
        IndividualMeterReadingRepository, GeneralMeterReadingRepository,
        MeterQueriesService, MeterCommandsService,
        MeterReadingQueriesService, MeterReadingCommandsService, MeterReadingCalculationsService,
        MeterEventEmitter
    ],
    exports: [
        IndividualMeterRepository, GeneralMeterRepository,
        IndividualMeterReadingRepository, GeneralMeterReadingRepository,
    ],
    controllers: [
        MeterQueries, MeterCommands,
        MeterReadingQueries, MeterReadingCommands
    ],
})
export class MeterModule { }