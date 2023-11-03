import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { AppealRepository } from "./appeal.repository";
import { getSubscriber, checkUser, RMQException, INCORRECT_USER_ROLE, checkUsers } from "@myhome/constants";
import { EventAddAppeal, ReferenceGetApartment, ReferenceGetMeters, ReferenceGetSubscribersAllInfo, ReferenceGetSubscribersByOwner, ReferenceGetTypeOfService, ReferenceGetTypesOfService } from "@myhome/contracts";
import { AppealEntity } from "./appeal.entity";
import { AddIndividualMeterData, AppealType, IAppealData, IAppealEntity, IGetAppeal, IMeter, IMeterWithTypeOfService, ITypeOfService, MeterType, ServiceNotificationType, UserRole, VerifyIndividualMeterData } from "@myhome/interfaces";
import { ServiceNotificationService } from "../notification/services/service-notification.service";

@Injectable()
export class AppealService {
    constructor(
        private readonly appealRepository: AppealRepository,
        private readonly rmqService: RMQService,
        private readonly notificationService: ServiceNotificationService
    ) { }

    public async getAppeals(userId: number, userRole: UserRole): Promise<{ appeals: IGetAppeal[] }> {
        switch (userRole) {
            case UserRole.Owner: {
                const { subscribers } = await this.getSubscribersByOId(userId);
                const subscriberIds = subscribers.map(s => s.id);
                const appeals = await this.appealRepository.findBySIds(subscriberIds);
                if (!appeals) {
                    return;
                }

                const { meters, typesOfService } = await this.getMeterData(appeals);

                const managementCompanyIds = Array.from(new Set(appeals.map(a => a.managementCompanyId)));
                const { profiles } = await checkUsers(
                    this.rmqService,
                    managementCompanyIds,
                    UserRole.ManagementCompany
                );
                return {
                    appeals: appeals
                        .map(appeal => {
                            const currentMC = profiles.find(p => p.id === appeal.managementCompanyId);
                            const { currentMeter, currentTOS } = this.getCurrentMeterData(appeal, typesOfService, meters);

                            return {
                                name: currentMC.name,
                                ...appeal,
                                data: this.getText(appeal, currentMeter, currentTOS).text
                            };
                        })
                };
            }
            case UserRole.ManagementCompany: {
                const appeals = await this.appealRepository.findByMCId(userId);

                if (!appeals) {
                    return;
                }

                const { meters, typesOfService } = await this.getMeterData(appeals);

                const subscriberIds = appeals.map(appeal => appeal.subscriberId);
                const { subscribers: subscribersAll } = await this.getSubscribersBySIds(subscriberIds);
                return {
                    appeals: appeals
                        .map(appeal => {
                            const currentSubscriber = subscribersAll.find(s => s.id === appeal.subscriberId);
                            const { currentMeter, currentTOS } = this.getCurrentMeterData(appeal, typesOfService, meters);

                            return {
                                address: currentSubscriber.address,
                                personalAccount: currentSubscriber.personalAccount,
                                name: currentSubscriber.name,
                                ...appeal,
                                data: this.getText(appeal, currentMeter, currentTOS).text
                            };
                        })
                };
            }
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
    }

    private async getMeterData(appeals: IAppealEntity[]) {
        const typeOfServiceIds = Array.from(new Set(appeals.filter(a => a.typeOfAppeal === AppealType.AddIndividualMeter)
            .map(a => JSON.parse(a.data).typeOfServiceId)));
        const meterIds = Array.from(new Set(appeals.filter(a => a.typeOfAppeal === AppealType.VerifyIndividualMeter)
            .map(a => JSON.parse(a.data).meterId)));

        const { meters } = await this.getMeters(meterIds);
        const { typesOfService } = await this.getTypesOfService(typeOfServiceIds);

        return { meters, typesOfService };
    }

    private getCurrentMeterData(
        appeal: IAppealEntity,
        typesOfService: ITypeOfService[], meters: IMeterWithTypeOfService[]
    ) {
        const currentMeter = meters.find(m =>
            m.id === JSON.parse(appeal.data).meterId);
        let currentTOS = typesOfService.find(tos =>
            tos.id === JSON.parse(appeal.data).typeOfServiceId);
        if (!currentTOS && currentMeter) {
            currentTOS = currentMeter.typeOfService;
        }

        return { currentMeter, currentTOS };
    }

    public async addAppeal(dto: EventAddAppeal.Request): Promise<EventAddAppeal.Response> {
        let meter: IMeter, typeOfService: ITypeOfService;

        await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
        await getSubscriber(this.rmqService, dto.subscriberId);

        switch (dto.typeOfAppeal) {
            case AppealType.AddIndividualMeter: {
                const data = dto.data as AddIndividualMeterData;
                await this.getApartment(data.apartmentId);
                ({ typeOfService } = await this.getTypeOfService(data.typeOfServiceId));
                break;
            }
            case AppealType.VerifyIndividualMeter: {
                const data = dto.data as VerifyIndividualMeterData;
                const { meters } = await this.getMeters([data.meterId]);
                meter = meters[0];
                typeOfService = meters[0].typeOfService;
                break;
            }
        }

        const newAppealEntity = new AppealEntity({
            managementCompanyId: dto.managementCompanyId,
            typeOfAppeal: dto.typeOfAppeal,
            subscriberId: dto.subscriberId,
            createdAt: new Date(dto.createdAt),
            data: JSON.stringify(dto.data),
        });
        const appeal = await this.appealRepository.create(newAppealEntity);
        const newAppeal: IAppealData = { ...appeal, data: dto.data };

        await this.sendNotification(appeal, meter, typeOfService);

        return { appeal: newAppeal };
    }

    private getText(appeal: IAppealEntity, meter?: IMeter, typeOfService?: ITypeOfService) {
        const data = JSON.parse(appeal.data);

        switch (appeal.typeOfAppeal) {
            case AppealType.AddIndividualMeter: {
                return {
                    title: `Отправлено обращение №${appeal.id}`,
                    description: "Добавление счётчика",
                    text: typeOfService ? `Прошу ввести ИПУ в эксплуатацию после его замены. ИПУ на услугу "${typeOfService.name}". Заводской номер - ${data.factoryNumber}. Дата поверки - ${this.formatDate(new Date(data.verifiedAt))}.` :
                        ""
                };
            }
            case AppealType.VerifyIndividualMeter: {
                return {
                    title: `Отправлено обращение №${appeal.id}`,
                    description: "Поверка счётчика",
                    text: meter && typeOfService ? `Прошу ввести ИПУ в эксплуатацию после проведения его поверки. ИПУ на услугу "${typeOfService.name}". Заводской номер - ${meter.factoryNumber}. Дата поверки - ${this.formatDate(new Date(meter.verifiedAt))}.` : ""
                };
            }
            case AppealType.ProblemOrQuestion:
                return {
                    title: `Отправлено обращение №${appeal.id}`,
                    description: "Проблема или вопрос",
                    text: data.text
                };
            case AppealType.Claim:
                return {
                    title: `Отправлено обращение №${appeal.id}`,
                    description: "Другое",
                    text: data.text
                };
        }
    }

    private async sendNotification(appeal: IAppealEntity, meter?: IMeter, typeOfService?: ITypeOfService) {
        const { title, description, text } = this.getText(appeal, meter, typeOfService);
        await this.notificationService.addServiceNotification({
            userId: appeal.managementCompanyId,
            userRole: UserRole.ManagementCompany,
            title: title,
            description: description,
            text: text,
            type: ServiceNotificationType.Appeal,
        });
    }

    private formatDate(date: Date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
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

    private async getMeters(meterIds: number[]): Promise<ReferenceGetMeters.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetMeters.Request,
                    ReferenceGetMeters.Response
                >
                (ReferenceGetMeters.topic, { ids: meterIds, meterType: MeterType.Individual });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getApartment(apartmentId: number): Promise<ReferenceGetApartment.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetApartment.Request,
                    ReferenceGetApartment.Response
                >
                (ReferenceGetApartment.topic, { id: apartmentId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getTypeOfService(typeOfServiceId: number): Promise<ReferenceGetTypeOfService.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetTypeOfService.Request,
                    ReferenceGetTypeOfService.Response
                >
                (ReferenceGetTypeOfService.topic, { id: typeOfServiceId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getTypesOfService(typeOfServiceIds: number[]): Promise<ReferenceGetTypesOfService.Response> {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetTypesOfService.Request,
                    ReferenceGetTypesOfService.Response
                >
                (ReferenceGetTypesOfService.topic, { typeOfServiceIds });
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