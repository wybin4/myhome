import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { AppealRepository } from "./appeal.repository";
import { getSubscriber, checkUser, RMQException, INCORRECT_USER_ROLE, checkUsers, getSubscribersAllInfo, getSubscribersByOId, getApartment, getTypeOfService, getMeters, getMeter, getTypesOfService } from "@myhome/constants";
import { EventAddAppeal } from "@myhome/contracts";
import { AppealEntity } from "./appeal.entity";
import { AddIndividualMeterData, AppealType, IAppealData, IAppealEntity, IGetAppeal, IMeter, IMeterWithTypeOfService, ITypeOfService, MeterType, ServiceNotificationType, UserRole, VerifyIndividualMeterData } from "@myhome/interfaces";
import { ServiceNotificationService } from "../notification/services/service-notification.service";
import path from "path";
import * as fs from "fs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppealService {
    constructor(
        private readonly appealRepository: AppealRepository,
        private readonly rmqService: RMQService,
        private readonly notificationService: ServiceNotificationService,
        private readonly configService: ConfigService
    ) { }

    public async getAppeals(userId: number, userRole: UserRole): Promise<{ appeals: IGetAppeal[] }> {
        switch (userRole) {
            case UserRole.Owner: {
                const { subscribers } = await getSubscribersByOId(this.rmqService, userId);
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
                const { subscribers: subscribersAll } = await getSubscribersAllInfo(this.rmqService, subscriberIds);
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

        const { meters } = await getMeters(this.rmqService, meterIds, MeterType.Individual);
        const { typesOfService } = await getTypesOfService(this.rmqService, typeOfServiceIds);

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
                await getApartment(this.rmqService, data.apartmentId);
                ({ typeOfService } = await getTypeOfService(this.rmqService, data.typeOfServiceId));

                const fileName = await this.uploadAttachment(data.attachment);
                data.attachment = fileName;
                break;
            }
            case AppealType.VerifyIndividualMeter: {
                const data = dto.data as VerifyIndividualMeterData;
                const { meter } = await getMeter(this.rmqService, data.meterId, MeterType.Individual);
                typeOfService = meter.typeOfService;

                const fileName = await this.uploadAttachment(data.attachment);
                data.attachment = fileName;
                break;
            }
        }


        const newAppealEntity = new AppealEntity({
            managementCompanyId: dto.managementCompanyId,
            typeOfAppeal: dto.typeOfAppeal,
            subscriberId: dto.subscriberId,
            createdAt: new Date(),
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

    private async uploadAttachment(attachment: string) {
        const buffer = Buffer.from(attachment, 'base64');
        const uploadDirectory = this.configService.get("UPLOAD_DIRECTORY");
        if (!fs.existsSync(uploadDirectory)) {
            fs.mkdirSync(uploadDirectory);
        }

        const filename = `${Date.now()}.${this.getFileType(buffer)}`;
        fs.writeFile(path.join(uploadDirectory, filename), buffer, (err) => {
            if (err) {
                throw new RMQException("Невозможно сохранить файл", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });

        return path.join(uploadDirectory, filename);
    }

    private getFileType(buffer: Buffer) {
        if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
            return "jpeg";
        } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            return "png";
        } else {
            return "unknown";
        }
    }

}