import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApartmentEntity } from "./entities/apartment.entity";
import { HouseEntity } from "./entities/house.entity";
import { SubscriberEntity } from "./entities/subscriber.entity";
import { ApartmentRepository } from "./repositories/apartment.repository";
import { HouseRepository } from "./repositories/house.repository";
import { SubscriberRepository } from "./repositories/subscriber.repository";
import { HouseQueries } from "./queries/house.queries";
import { HouseCommands } from "./commands/house.commands";
import { ApartmentQueries } from "./queries/apartment.queries";
import { ApartmentCommands } from "./commands/apartment.commands";
import { SubscriberQueries } from "./queries/subscriber.queries";
import { SubscriberCommands } from "./commands/subscriber.commands";
import { HouseService } from "./services/house.service";
import { ApartmentService } from "./services/apartment.service";
import { SubscriberService } from "./services/subscriber.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([HouseEntity, ApartmentEntity, SubscriberEntity]),
  ],
  providers: [
    HouseRepository, ApartmentRepository, SubscriberRepository,
    HouseService, ApartmentService, SubscriberService
  ],
  exports: [HouseService, SubscriberService, ApartmentService],
  controllers: [
    HouseQueries, HouseCommands,
    ApartmentQueries, ApartmentCommands,
    SubscriberQueries, SubscriberCommands
  ],
})
export class SubscriberModule { }
