import { EventGetEvents } from "@myhome/contracts";
import { HttpStatus, Injectable } from "@nestjs/common";
import { HouseNotificationService } from "../notification/services/house-notification.service";
import { VotingService } from "../voting/voting.service";
import { AppealService } from "../appeal/appeal.service";
import { EventType, IGetEvents } from "@myhome/interfaces";
import { RMQException } from "@myhome/constants";

@Injectable()
export class EventService {
    constructor(
        private readonly appealService: AppealService,
        private readonly notificationService: HouseNotificationService,
        private readonly votingService: VotingService,
    ) { }

    public async getEvents(dto: EventGetEvents.Request): Promise<EventGetEvents.Response> {
        const events: IGetEvents = { appeals: [], notifications: [], votings: [] };

        for (const event of dto.events) {
            switch (event) {
                case EventType.Appeal:
                    ({ appeals: events.appeals } = await this.appealService.getAppeals(dto.userId, dto.userRole));
                    break;
                case EventType.Voting:
                    ({ votings: events.votings } = await this.votingService.getVotings(dto.userId, dto.userRole));
                    break;
                case EventType.Notification:
                    ({ notifications: events.notifications } = await this.notificationService.getHouseNotifications(dto.userId, dto.userRole));
                    break;
                default:
                    throw new RMQException("Неверно выбран тип события", HttpStatus.BAD_REQUEST);
            }
        }

        return { events };
    }
}