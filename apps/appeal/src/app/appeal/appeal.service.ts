import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { AppealRepository, TypeOfAppealRepository } from "./appeal.repository";
import { APPEAL_NOT_EXIST, TYPE_OF_APPEAL_NOT_EXIST, getSubscriber, checkUser, getGenericObject, RMQException, APPEALS_NOT_EXIST, TYPES_OF_APPEAL_NOT_EXIST, SENDER_NOT_EXIST } from "@myhome/constants";
import { AppealAddAppeal, AppealGetAppeal, AppealGetAppealsByMCId, ReferenceGetSubscriber, ReferenceGetSubscribersAllInfo, ReferenceGetSubscribersByOwner } from "@myhome/contracts";
import { AppealEntity } from "./appeal.entity";
import { IAppeal, ISubscriber, SenderType, UserRole } from "@myhome/interfaces";


@Injectable()
export class AppealService {
    constructor(
        private readonly appealRepository: AppealRepository,
        private readonly typeOfAppealRepository: TypeOfAppealRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async getAppealsByMCId(managementCompanyId: number):
        Promise<AppealGetAppealsByMCId.Response> {
        const appeals = await this.appealRepository.findByMCId(managementCompanyId);
        if (!appeals) {
            throw new RMQException(APPEALS_NOT_EXIST.message, APPEALS_NOT_EXIST.status);
        }
        const typesOfAppeal = await this.typeOfAppealRepository.findMany();
        if (!typesOfAppeal) {
            throw new RMQException(TYPES_OF_APPEAL_NOT_EXIST.message, TYPES_OF_APPEAL_NOT_EXIST.status);
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
                    const currentTypeOfAppeal = typesOfAppeal.find(t => t.id === appeal.typeOfAppealId);
                    return {
                        typeOfAppealName: currentTypeOfAppeal.name,
                        apartmentName: currentSubscriber.address,
                        personalAccount: currentSubscriber.personalAccount,
                        ownerName: currentSubscriber.name,
                        ...appeal
                    };
                })

        };
    }

    public async getAppeals(userId: number, userRole: SenderType): Promise<IAppeal[]> {
        let subscribers: ISubscriber[], subscriberIds: number[];
        switch (userRole) {
            case SenderType.ManagementCompany:
                await checkUser(this.rmqService, userId, UserRole.ManagementCompany);
                return await this.appealRepository.findByMCId(userId);
            case SenderType.Subscriber:
                await checkUser(this.rmqService, userId, UserRole.Owner);
                ({ subscribers } = await this.getSubscribersByOId(userId));
                if (!subscribers) {
                    return;
                }
                subscriberIds = subscribers.map(sid => sid.id);
                return await this.appealRepository.findBySIds(subscriberIds);
            default:
                throw new RMQException(SENDER_NOT_EXIST.message, SENDER_NOT_EXIST.status);
        }
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

    public async getAppeal(id: number): Promise<AppealGetAppeal.Response> {
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

    public async addAppeal(dto: AppealAddAppeal.Request) {
        const typeOfAppeal = await this.typeOfAppealRepository.findById(dto.typeOfAppealId);
        if (!typeOfAppeal) {
            throw new RMQException(TYPE_OF_APPEAL_NOT_EXIST.message, TYPE_OF_APPEAL_NOT_EXIST.status);
        }

        await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
        await getSubscriber(this.rmqService, dto.subscriberId);

        const newAppealEntity = new AppealEntity({
            managementCompanyId: dto.managementCompanyId,
            typeOfAppealId: dto.typeOfAppealId,
            subscriberId: dto.subscriberId,
            createdAt: new Date(dto.createdAt),
            data: String(dto.data),
        });
        const newAppeal = await this.appealRepository.create(newAppealEntity);

        // const typeOfAppealName = (await this.typeOfAppealRepository.findById(dto.typeOfAppealId)).name;
        // switch (typeOfAppealName) {
        //     case AppealType.AddIndividualMeter:
        //         this.sendNotification(
        //             dto,
        //             'Было добавлено обращение по поводу замены счётчика'
        //         )
        //         break;
        //     case AppealType.VerifyIndividualMeter:
        //         this.sendNotification(
        //             dto,
        //             'Было добавлено обращение по поводу поверки счётчика'
        //         )
        //         break;
        //     case AppealType.Claim:
        //     case AppealType.ProblemOrQuestion:
        //         this.sendNotification(
        //             dto,
        //             'Было добавлено обращение'
        //         )
        //         break;
        // }

        return { appeal: newAppeal };
    }

    // ИСПРАВИТЬ!!!
    // private async sendNotification(dto: AppealAddAppeal.Request, message: string) {
    //     const managementCompanyId = await this.rmqService.send
    //         <ReferenceGetManagementCompany.Request, ReferenceGetManagementCompany.Response>
    //         (ReferenceGetManagementCompany.topic, { subscriberId: dto.subscriberId });

    //     await this.rmqService.notify(AddNotification.topic,
    //         {
    //             userId: managementCompanyId,
    //             userRole: UserRole.ManagementCompany,
    //             notificationType: NotificationType.SentAppeal,
    //             message: message,
    //             createdAt: new Date(),
    //         }
    //     );
    // }

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