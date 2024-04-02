import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { AppealRepository } from "./appeal.repository";
import { getSubscriber, checkUser, RMQException, INCORRECT_USER_ROLE, checkUsers, getSubscribersAllInfo, getSubscribersByOId, getApartment, getTypeOfService, getMeters, getMeter, getTypesOfService, APPEAL_NOT_EXIST, addMeter, updateMeter, METERS_NOT_EXIST } from "@myhome/constants";
import { EventAddAppeal, EventUpdateAppeal } from "@myhome/contracts";
import { AppealEntity } from "./appeal.entity";
import { AddIndividualMeterData, AppealStatus, AppealType, IAppealEntity, IGetAppeal, IMeta, IMeter, IMeterWithTypeOfService, ITypeOfService, MeterType, ServiceNotificationType, UserRole, VerifyIndividualMeterData } from "@myhome/interfaces";
import { ServiceNotificationService } from "../notification/services/service-notification.service";
import path from "path";
import * as fs from "fs";
import { ConfigService } from "@nestjs/config";
import { promisify } from "util";

@Injectable()
export class AppealService {
    constructor(
        private readonly appealRepository: AppealRepository,
        private readonly rmqService: RMQService,
        private readonly notificationService: ServiceNotificationService,
        private readonly configService: ConfigService
    ) { }

    public async getAppeals(userId: number, userRole: UserRole, meta: IMeta): Promise<{ appeals: IGetAppeal[]; totalCount?: number }> {
        switch (userRole) {
            case UserRole.Owner: {
                const { subscribers } = await getSubscribersByOId(this.rmqService, userId);
                const subscriberIds = subscribers.map(s => s.id);
                const { appeals, totalCount } = await this.appealRepository.findBySIds(subscriberIds, meta);
                if (!appeals || !appeals.length) {
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
                            let attachment: string;
                            switch (appeal.typeOfAppeal) {
                                case (AppealType.AddIndividualMeter):
                                    attachment = (JSON.parse(appeal.data) as AddIndividualMeterData).attachment;
                                    break;
                                case (AppealType.VerifyIndividualMeter):
                                    attachment = (JSON.parse(appeal.data) as VerifyIndividualMeterData).attachment;
                                    break;
                            }
                            return {
                                name: currentMC.name,
                                ...appeal,
                                data: this.getText(appeal, "get", currentMeter, currentTOS).text,
                                attachment
                            };
                        })
                    ,
                    totalCount
                };
            }
            case UserRole.ManagementCompany: {
                const { appeals, totalCount } = await this.appealRepository.findByMCId(userId, meta);
                if (!appeals || !appeals.length) {
                    return;
                }
                const { meters, typesOfService } = await this.getMeterData(appeals);

                const subscriberIds = appeals.map(appeal => appeal.subscriberId);
                const { subscribers: subscribersAll } = await getSubscribersAllInfo(this.rmqService, subscriberIds);

                const files = await this.getFileFromAppeals(appeals);

                return {
                    appeals: appeals
                        .map(appeal => {
                            const currentSubscriber = subscribersAll.find(s => s.id === appeal.subscriberId);
                            const { currentMeter, currentTOS } = this.getCurrentMeterData(appeal, typesOfService, meters);
                            const currentFile = files.find(f => f.id === appeal.id);

                            return {
                                address: currentSubscriber.address,
                                personalAccount: currentSubscriber.personalAccount,
                                name: currentSubscriber.name,
                                ...appeal,
                                data: this.getText(appeal, "get", currentMeter, currentTOS).text,
                                attachment: currentFile ? currentFile.file : undefined
                            };
                        }),
                    totalCount
                };
            }
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
    }

    private async getMeterData(appeals: IAppealEntity[]) {
        let typeOfServiceIds = Array.from(new Set(appeals.filter(a => a.typeOfAppeal === AppealType.AddIndividualMeter)
            .map(a => JSON.parse(a.data).typeOfServiceId)));
        const meterIds = Array.from(new Set(appeals.filter(a => a.typeOfAppeal === AppealType.VerifyIndividualMeter)
            .map(a => JSON.parse(a.data).meterId)));

        if (!meterIds.length && !typeOfServiceIds.length) {
            return { meters: undefined, typesOfService: undefined };
        } else if (meterIds.length) {
            const { meters } = await getMeters(this.rmqService, meterIds, MeterType.Individual);
            if (!meters.length) {
                throw new RMQException(METERS_NOT_EXIST.message, METERS_NOT_EXIST.status);
            }

            if (!typeOfServiceIds.length) {
                typeOfServiceIds = meters.map(m => m.typeOfServiceId);
            }
            if (!typeOfServiceIds.length) {
                return { meters: meters, typesOfService: undefined };
            }

            const { typesOfService } = typeOfServiceIds.length ? await getTypesOfService(this.rmqService, typeOfServiceIds) : undefined;

            return { meters, typesOfService };
        } else if (typeOfServiceIds.length) {
            const { typesOfService } = await getTypesOfService(this.rmqService, typeOfServiceIds);
            return { meters: undefined, typesOfService };
        }
    }

    private getCurrentMeterData(
        appeal: IAppealEntity,
        typesOfService: ITypeOfService[], meters: IMeterWithTypeOfService[]
    ) {
        if (!meters && !typesOfService) {
            return { currentMeter: undefined, currentTOS: undefined };
        } else if (!meters && typesOfService) {
            const currentTOS = typesOfService.find(tos =>
                tos.id === JSON.parse(appeal.data).typeOfServiceId);
            return { currentMeter: undefined, currentTOS };
        }
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
        let meter: IMeterWithTypeOfService, typeOfService: ITypeOfService;
        const { profile: mc } = await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
        await getSubscriber(this.rmqService, dto.subscriberId);

        const getResult = async (
            appealDto: EventAddAppeal.Request,
            meter?: IMeter,
            typeOfService?: ITypeOfService
        ) => {
            const appeal = await this.createAppealEntity(appealDto, meter, typeOfService);

            return {
                appeal: {
                    name: mc.name,
                    ...appeal,
                    data: this.getText(appeal, "add", meter, typeOfService).text
                }
            };
        };

        switch (dto.typeOfAppeal) {
            case AppealType.AddIndividualMeter: {
                await getApartment(this.rmqService, dto.apartmentId);
                ({ typeOfService } = await getTypeOfService(this.rmqService, dto.typeOfServiceId));

                const fileName = await this.uploadAttachment(dto.attachment);
                dto.attachment = fileName;

                break;
            }
            case AppealType.VerifyIndividualMeter: {
                ({ meter } = await getMeter(this.rmqService, dto.meterId, MeterType.Individual));
                typeOfService = meter.typeOfService;

                const fileName = await this.uploadAttachment(dto.attachment);
                dto.attachment = fileName;

                break;
            }
        }
        return await getResult(dto, meter, typeOfService);
    }

    public async updateAppeal(dto: EventUpdateAppeal.Request): Promise<EventUpdateAppeal.Response> {
        if (dto.status === AppealStatus.Processing) {
            throw new RMQException("Вы не можете изменить статус обращения на обработку", HttpStatus.BAD_REQUEST);
        }

        const existed = await this.appealRepository.findById(dto.id);
        if (!existed) {
            throw new RMQException(APPEAL_NOT_EXIST.message(dto.id), APPEAL_NOT_EXIST.status);
        }

        if (existed.status !== AppealStatus.Processing) {
            throw new RMQException("Вы не можете изменить статус закрытого или обработанного обращения", HttpStatus.BAD_REQUEST);
        }

        const appealEntity = new AppealEntity(existed).update(dto.status);
        await this.appealRepository.update(appealEntity);
        const appeal = appealEntity.get();

        if (dto.status === AppealStatus.Closed) {
            switch (appealEntity.typeOfAppeal) {
                case AppealType.AddIndividualMeter: {
                    const data = (appeal.data as AddIndividualMeterData);
                    await addMeter(this.rmqService,
                        {
                            ...data,
                            verifiedAt: String(data.verifiedAt),
                            issuedAt: String(data.issuedAt),
                            meterType: MeterType.Individual,
                            previousReading: undefined,
                            previousReadAt: undefined
                        }
                    );
                    break;
                }
                case AppealType.VerifyIndividualMeter: {
                    const data = (appeal.data as VerifyIndividualMeterData);
                    const id = data.meterId;
                    await updateMeter(this.rmqService,
                        {
                            id,
                            verifiedAt: String(data.verifiedAt),
                            issuedAt: String(data.issuedAt),
                            meterType: MeterType.Individual
                        }
                    );
                }
            }
        }

        await this.sendNotification(appealEntity, "update");

        return { appeal };
    }

    private async createAppealEntity(
        dtoAppeal: EventAddAppeal.Request,
        meter?: IMeter,
        typeOfService?: ITypeOfService
    ) {
        const { managementCompanyId, typeOfAppeal, subscriberId, ...rest } = dtoAppeal;

        const newAppealEntity = new AppealEntity({
            managementCompanyId: managementCompanyId,
            typeOfAppeal: typeOfAppeal,
            subscriberId: subscriberId,
            createdAt: new Date(),
            data: JSON.stringify(rest),
        });

        const appeal = await this.appealRepository.create(newAppealEntity);
        await this.sendNotification(appeal, "add", meter, typeOfService);

        return appeal;
    }

    private getText(appeal: IAppealEntity, type: "add" | "update" | "get", meter?: IMeter, typeOfService?: ITypeOfService) {
        const data = JSON.parse(appeal.data);
        let typeInText = "";
        switch (type) {
            case "add":
                typeInText = "Отправлено";
                break;
            case "update": {
                switch (appeal.status) {
                    case AppealStatus.Closed: {
                        typeInText = "Закрыто";
                        break;
                    }
                    case AppealStatus.Rejected: {
                        typeInText = "Отклонено";
                        break;
                    }
                }
                typeInText = "Изменено";
            }
        }

        switch (appeal.typeOfAppeal) {
            case AppealType.AddIndividualMeter: {
                return {
                    title: `${typeInText} обращение №${appeal.id}`,
                    description: "Добавление счётчика",
                    text: typeOfService ? `Прошу ввести ИПУ в эксплуатацию после его замены. ИПУ на услугу "${typeOfService.name}". Заводской номер - ${data.factoryNumber}. Дата поверки - ${this.formatDate(new Date(data.verifiedAt))}.` :
                        ""
                };
            }
            case AppealType.VerifyIndividualMeter: {
                return {
                    title: `${typeInText} обращение №${appeal.id}`,
                    description: "Поверка счётчика",
                    text: meter && typeOfService ? `Прошу ввести ИПУ в эксплуатацию после проведения его поверки. ИПУ на услугу "${typeOfService.name}". Заводской номер - ${meter.factoryNumber}. Дата поверки - ${this.formatDate(new Date(meter.verifiedAt))}.` : ""
                };
            }
            case AppealType.ProblemOrQuestion:
                return {
                    title: `${typeInText} обращение №${appeal.id}`,
                    description: "Проблема или вопрос",
                    text: data.text
                };
            case AppealType.Claim:
                return {
                    title: `${typeInText} обращение №${appeal.id}`,
                    description: "Другое",
                    text: data.text
                };
        }
    }

    private async sendNotification(appeal: IAppealEntity, type: "add" | "update", meter?: IMeter, typeOfService?: ITypeOfService,) {
        const { title, description, text } = this.getText(appeal, type, meter, typeOfService);
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

        return filename;
    }

    private async readAttachments(files: { fileName: string; id: number }[]) {
        const uploadDirectory = this.configService.get("UPLOAD_DIRECTORY");

        const readFileAsync = promisify(fs.readFile);
        const promises = files.map(async (file) => {
            try {
                file.fileName = path.join(uploadDirectory, file.fileName);
                const buffer = await readFileAsync(file.fileName);
                return { id: file.id, file: buffer.toString('base64') };
            } catch (error) {
                throw new RMQException("Ошибка при чтении файла", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });

        return Promise.all(promises);
    }

    private async getFileFromAppeals(appeals: IAppealEntity[]) {
        const appealWithFiles = appeals.
            filter(a =>
                a.typeOfAppeal === AppealType.AddIndividualMeter
                || a.typeOfAppeal === AppealType.VerifyIndividualMeter
            )
            .map(appeal => {
                return {
                    id: appeal.id,
                    fileName: JSON.parse(appeal.data).attachment
                };
            });

        return await this.readAttachments(appealWithFiles);
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