import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import { NotificationModule } from "../notification/notification.module";
import { AppealModule } from "../appeal/appeal.module";
import { VotingModule } from "../voting/voting.module";

@Module({
    imports: [
        NotificationModule,
        AppealModule,
        VotingModule
    ],
    providers: [EventService],
    controllers: [EventController],
})
export class EventModule { }