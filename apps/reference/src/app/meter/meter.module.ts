import { TypeOrmModule } from "@nestjs/typeorm";
import { GeneralMeterReadings } from "./entities/general-meter-reading.entity";
import { GeneralMeters } from "./entities/general-meter.entity";
import { IndividualMeterReadings } from "./entities/individual-meter-reading.entity";
import { IndividualMeters } from "./entities/individual-meter.entity";
import { GeneralMeterReadingRepository } from "./repositories/general-meter-reading.repository";
import { IndividualMeterReadingRepository } from "./repositories/individual-meter-reading.repository";
import { IndividualMeterRepository } from "./repositories/individual-meter.repository";
import { Module } from "@nestjs/common";
import { MeterService } from "./services/meter.service";
import { MeterController } from "./controllers/meter.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature(
            [
                IndividualMeters, GeneralMeters,
                IndividualMeterReadings, GeneralMeterReadings
            ]
        ),
    ],
    providers:
        [
            IndividualMeterRepository, GeneralMeterReadingRepository,
            IndividualMeterReadingRepository, GeneralMeterReadingRepository,
            MeterService
        ],
    exports:
        [
            IndividualMeterRepository, GeneralMeterReadingRepository,
            IndividualMeterReadingRepository, GeneralMeterReadingRepository
        ],
    controllers: [MeterController],
})
export class MeterModule { }
