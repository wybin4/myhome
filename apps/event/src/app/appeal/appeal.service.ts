import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { AppealRepository } from "./appeal.repository";
import { APPEAL_NOT_EXIST, getSubscriber, checkUser, getGenericObject, RMQException, APPEALS_NOT_EXIST, addNotification } from "@myhome/constants";
import { EventAddAppeal, EventGetAppeal, EventGetAppealsByMCId, ReferenceGetSubscriber, ReferenceGetSubscribersAllInfo, ReferenceGetSubscribersByOwner } from "@myhome/contracts";
import { AppealEntity } from "./appeal.entity";
import { AppealType, IAppeal, NotificationStatus, ServiceNotificationType, UserRole } from "@myhome/interfaces";

@Injectable()
export class AppealService {
    constructor(
        private readonly appealRepository: AppealRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async getAppealsByMCId(managementCompanyId: number):
        Promise<EventGetAppealsByMCId.Response> {
        const appeals = await this.appealRepository.findByMCId(managementCompanyId);
        if (!appeals) {
            throw new RMQException(APPEALS_NOT_EXIST.message, APPEALS_NOT_EXIST.status);
        }

        const subscriberIds = appeals.map(appeal => appeal.subscriberId);

        const { subscribers } = await this.getSubscribers(subscriberIds);

        return {
            appeals: appeals
                .map(appeal => {
                    const currentSubscriber = subscribers.find(s => s.id === appeal.subscriberId);
                    return {
                        currentSubscriber,
                        appeal
                    };
                })
                .filter(({ currentSubscriber }) => currentSubscriber)
                .map(({ currentSubscriber, appeal }) => {
                    return {
                        apartmentName: currentSubscriber.address,
                        personalAccount: currentSubscriber.personalAccount,
                        ownerName: currentSubscriber.name,
                        ...appeal
                    };
                })

        };
    }

    private async getSubscribersByOId(ownerId: number) {
        try {
            return await
                this.rmqService.send<
                    ReferenceGetSubscribersByOwner.Request,
                    ReferenceGetSubscribersByOwner.Response
                >
                    (ReferenceGetSubscribersByOwner.topic, { ownerId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    public async getAppeal(id: number): Promise<EventGetAppeal.Response> {
        const appeal = await getGenericObject<AppealEntity>
            (
                this.appealRepository,
                (item) => new AppealEntity(item),
                id,
                APPEAL_NOT_EXIST
            ) as IAppeal;
        const { subscriber } = await this.getSubscriber(appeal.subscriberId);
        return {
            appeal: {
                ...appeal,
                ownerId: subscriber.ownerId
            }
        };
    }

    private async getSubscriber(subscriberId: number) {
        try {
            return await
                this.rmqService.send<
                    ReferenceGetSubscriber.Request,
                    ReferenceGetSubscriber.Response
                >
                    (ReferenceGetSubscriber.topic, { id: subscriberId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
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
        await addNotification(this.rmqService, {
            userId: appeal.managementCompanyId,
            userRole: UserRole.ManagementCompany,
            title: title,
            description: description,
            text: text,
            type: ServiceNotificationType.Appeal,
            createdAt: new Date(),
            status: NotificationStatus.Unread
        });
    }

    private async getSubscribers(subscriberIds: number[]): Promise<ReferenceGetSubscribersAllInfo.Response> {
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
}