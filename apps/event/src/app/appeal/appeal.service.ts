import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { AppealRepository } from "./appeal.repository";
import { getSubscriber, checkUser, RMQException, INCORRECT_USER_ROLE, checkUsers } from "@myhome/constants";
import { EventAddAppeal, ReferenceGetSubscribersAllInfo, ReferenceGetSubscribersByOwner } from "@myhome/contracts";
import { AppealEntity } from "./appeal.entity";
import { AppealType, IAppeal, IGetAppeal, ISubscriber, ISubscriberAllInfo, ServiceNotificationType, UserRole } from "@myhome/interfaces";
import { ServiceNotificationService } from "../notification/services/service-notification.service";

@Injectable()
export class AppealService {
    constructor(
        private readonly appealRepository: AppealRepository,
        private readonly rmqService: RMQService,
        private readonly notificationService: ServiceNotificationService
    ) { }

    public async getAppeals(userId: number, userRole: UserRole): Promise<{ appeals: IGetAppeal[] }> {
        let appeals: IAppeal[], subscriberIds: number[],
            subscribersAll: ISubscriberAllInfo[], subscribers: ISubscriber[],
            managementCompanyIds: number[], profiles = [];

        switch (userRole) {
            case UserRole.Owner:
                ({ subscribers } = await this.getSubscribersByOId(userId));
                subscriberIds = subscribers.map(s => s.id);
                appeals = await this.appealRepository.findBySIds(subscriberIds);
                if (!appeals) {
                    return;
                }
                managementCompanyIds = Array.from(new Set(appeals.map(a => a.managementCompanyId)));
                ({ profiles } = await checkUsers(
                    this.rmqService,
                    managementCompanyIds,
                    UserRole.ManagementCompany
                ));
                return {
                    appeals: appeals
                        .map(appeal => {
                            const currentMC = profiles.find(p => p.id === appeal.managementCompanyId);
                            return {
                                name: currentMC.name,
                                ...appeal
                            };
                        })
                };
            case UserRole.ManagementCompany:
                appeals = await this.appealRepository.findByMCId(userId);
                if (!appeals) {
                    return;
                }
                subscriberIds = appeals.map(appeal => appeal.subscriberId);
                ({ subscribers: subscribersAll } = await this.getSubscribersBySIds(subscriberIds));
                return {
                    appeals: appeals
                        .map(appeal => {
                            const currentSubscriber = subscribersAll.find(s => s.id === appeal.subscriberId);
                            return {
                                address: currentSubscriber.address,
                                personalAccount: currentSubscriber.personalAccount,
                                name: currentSubscriber.name,
                                ...appeal
                            };
                        })
                };
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
    }

    public async addAppeal(dto: EventAddAppeal.Request) {
        await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
        await getSubscriber(this.rmqService, dto.subscriberId);

        const newAppealEntity = new AppealEntity({
            managementCompanyId: dto.managementCompanyId,
            typeOfAppeal: dto.typeOfAppeal,
            subscriberId: dto.subscriberId,
            createdAt: new Date(dto.createdAt),
            data: String(dto.data),
        });
        const newAppeal = await this.appealRepository.create(newAppealEntity);

        await this.sendNotification(newAppeal);

        return { appeal: newAppeal };
    }

    // ИСПРАВИТЬ!!!!!
    // добавить текст
    private getText(appeal: IAppeal) {
        switch (appeal.typeOfAppeal) {
            case AppealType.AddIndividualMeter:
                return {
                    title: `Отправлено обращение №${appeal.id}`,
                    description: "Добавление счётчика",
                    text: ""
                };
            case AppealType.VerifyIndividualMeter:
                return {
                    title: `Отправлено обращение №${appeal.id}`,
                    description: "Поверка счётчика",
                    text: ""
                };
            case AppealType.ProblemOrQuestion:
                return {
                    title: `Отправлено обращение №${appeal.id}`,
                    description: "Проблема или вопрос",
                    text: ""
                };
        }
    }

    private async sendNotification(appeal: IAppeal) {
        const { title, description, text } = this.getText(appeal);
        await this.notificationService.addServiceNotification({
            userId: appeal.managementCompanyId,
            userRole: UserRole.ManagementCompany,
            title: title,
            description: description,
            text: text,
            type: ServiceNotificationType.Appeal,
        });
    }

    private async getSubscribersBySIds(subscriberIds: number[]): Promise<ReferenceGetSubscribersAllInfo.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetSubscribersAllInfo.Request,
                    ReferenceGetSubscribersAllInfo.Response
                >
                (ReferenceGetSubscribersAllInfo.topic, { ids: subscriberIds });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getSubscribersByOId(ownerId: number) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetSubscribersByOwner.Request,
                    ReferenceGetSubscribersByOwner.Response
                >
                (ReferenceGetSubscribersByOwner.topic, { ownerId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }
}