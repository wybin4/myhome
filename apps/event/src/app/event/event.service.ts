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
        const events: IGetEvents = {
            appeals: { appeals: [], totalCount: 0 },
            notifications: { notifications: [], totalCount: 0 },
            votings: { votings: [], totalCount: 0 }
        };

        for (const event of dto.events) {
            switch (event) {
                case EventType.Appeal: {
                    const data = await this.appealService.getAppeals(dto.userId, dto.userRole, dto.meta);
                    if (data) {
                        events.appeals.appeals = data.appeals;
                        events.appeals.totalCount = data.totalCount;
                    }
                    break;
                }
                case EventType.Voting: {
                    const data = await this.votingService.getVotings(dto.userId, dto.userRole, dto.meta);
                    if (data) {
                        events.votings.votings = data.votings;
                        events.votings.totalCount = data.totalCount;
                    }
                    break;
                }
                case EventType.Notification: {
                    const data = await this.notificationService.getHouseNotifications(dto.userId, dto.userRole, dto.meta);
                    if (data) {
                        events.notifications.notifications = data.notifications;
                        events.notifications.totalCount = data.totalCount;
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