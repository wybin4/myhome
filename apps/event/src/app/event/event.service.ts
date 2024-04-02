import { EventGetEvents } from "@myhome/contracts";
import { HttpStatus, Injectable } from "@nestjs/common";
import { HouseNotificationService } from "../notification/services/house-notification.service";
import { VotingService } from "../voting/voting.service";
import { AppealService } from "../appeal/appeal.service";
import { EventTypeRequest, EventTypeResponse, IGetEvents, IGetNotificationAndVoting } from "@myhome/interfaces";
import { RMQException } from "@myhome/constants";

@Injectable()
export class EventService {
    constructor(
        private readonly appealService: AppealService,
        private readonly notificationService: HouseNotificationService,
        private readonly votingService: VotingService,
    ) { }

    private async getNotificationsAndVotings(dto: EventGetEvents.Request) {
        const filters = dto.meta.filters || [];
        const eventTypeFilterIndex = filters.findIndex(filter => filter.filterField === "eventType");
        const remainingFilters = filters.filter((_, index) => index !== eventTypeFilterIndex);
        const eventType = eventTypeFilterIndex !== -1 ? filters[eventTypeFilterIndex] : undefined;
        const metaWithoutEventType = { ...dto.meta, filters: remainingFilters };

        const results: IGetNotificationAndVoting[] = [];
        let totalCount = 0;
        try {
        if (eventType && eventType.filterArray) {
            if (eventType.filterArray.includes("Notification")) {
                    const notifications = await this.notificationService.getHouseNotifications(dto.userId, dto.userRole, metaWithoutEventType);
                    results.push(...notifications.notifications.map(notification => ({
                        notification,
                        createdAt: notification.createdAt,
                        eventType: EventTypeResponse.Notification,
                    })));
                    totalCount += notifications.totalCount;
                }
            if (eventType.filterArray.includes("Voting")) {
                    const votings = await this.votingService.getVotings(dto.userId, dto.userRole, metaWithoutEventType);
                    results.push(...votings.votings.map(voting => ({
                        voting,
                        createdAt: voting.createdAt,
                        eventType: EventTypeResponse.Voting,
                    })));
                    totalCount += votings.totalCount;
                }
            } else {
                const [notifications, votings] = await Promise.all([
                    this.notificationService.getHouseNotifications(dto.userId, dto.userRole, metaWithoutEventType),
                    this.votingService.getVotings(dto.userId, dto.userRole, metaWithoutEventType)
                ]);
                results.push(...notifications.notifications.map(notification => ({
                    notification,
                    createdAt: notification.createdAt,
                    eventType: EventTypeResponse.Notification,
                })), ...votings.votings.map(voting => ({
                    voting,
                    createdAt: voting.createdAt,
                    eventType: EventTypeResponse.Voting,
                })));
                totalCount = notifications.totalCount + votings.totalCount;
            }
        } catch (e) {
            console.log(e)
        }

        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return {
            notificationsAndVotings: results,
            totalCount
        };
    }

    public async getEvents(dto: EventGetEvents.Request): Promise<EventGetEvents.Response> {
        const events: IGetEvents = {
            appeals: { appeals: [], totalCount: 0 },
            notificationsAndVotings: { notificationsAndVotings: [], totalCount: 0 },
        };

        switch (dto.eventType) {
            case EventTypeRequest.Appeal: {
                const data = await this.appealService.getAppeals(dto.userId, dto.userRole, dto.meta);
                if (data) {
                    events.appeals.appeals = data.appeals;
                    events.appeals.totalCount = data.totalCount;
                }
                break;
            }
            case EventTypeRequest.NotificationAndVoting: {
                const data = await this.getNotificationsAndVotings(dto);
                if (data) {
                    events.notificationsAndVotings.notificationsAndVotings = data.notificationsAndVotings;
                    events.notificationsAndVotings.totalCount = (data.totalCount) ? data.totalCount : 0;
                }
                break;
            }
            default:
                throw new RMQException("Неверно выбран тип события", HttpStatus.BAD_REQUEST);
        }
        return { events };
    }
}