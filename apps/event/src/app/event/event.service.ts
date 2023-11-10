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
                case EventType.Appeal: {
                    const data = await this.appealService.getAppeals(dto.userId, dto.userRole);
                    if (data) {
                        events.appeals = data.appeals;
                    }
                    break;
                }
                case EventType.Voting: {
                    const data = await this.votingService.getVotings(dto.userId, dto.userRole);
                    if (data) {
                        events.votings = data.votings;
                    }
                    break;
                }
                case EventType.Notification: {
                    const data = await this.notificationService.getHouseNotifications(dto.userId, dto.userRole);
                    if (data) {
                        events.notifications = data.notifications;
                    }
                    break;
                }
                default:
                    throw new RMQException("Неверно выбран тип события", HttpStatus.BAD_REQUEST);
            }
        }

        return { events };
    }
}