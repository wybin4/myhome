import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { AppealRepository, TypeOfAppealRepository } from "./repositories/appeal.repository";
import { APPEAL_NOT_EXIST, TYPE_OF_APPEAL_NOT_EXIST, getSubscriber, checkUser } from "@myhome/constants";
import { AddNotification, AppealAddAppeal, ReferenceGetManagementCompany } from "@myhome/contracts";
import { AppealEntity } from "./entities/appeal.entity";
import { AppealType, NotificationType, UserRole } from "@myhome/interfaces";


@Injectable()
export class AppealService {
    constructor(
        private readonly appealRepository: AppealRepository,
        private readonly typeOfAppealRepository: TypeOfAppealRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async getAppeal(id: number) {
        const appeal = await this.appealRepository.findAppealById(id);
        if (!appeal) {
            throw new RMQError(APPEAL_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const gettedAppeal = new AppealEntity(appeal);
        return { gettedAppeal };
    }

    public async addAppeal(dto: AppealAddAppeal.Request) {
        const typeOfAppeal = await this.typeOfAppealRepository.findById(dto.typeOfAppealId);
        if (!typeOfAppeal) {
            throw new RMQError(TYPE_OF_APPEAL_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }

        await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
        await getSubscriber(this.rmqService, dto.subscriberId);

        const newAppealEntity = new AppealEntity({
            managementCompanyId: dto.managementCompanyId,
            typeOfAppealId: dto.typeOfAppealId,
            subscriberId: dto.subscriberId,
            createdAt: new Date(dto.createdAt),
            status: dto.status,
            data: String(dto.data),
        });
        const newAppeal = await this.appealRepository.createAppeal(newAppealEntity);

        const typeOfAppealName = (await this.typeOfAppealRepository.findById(dto.typeOfAppealId)).name;
        switch (typeOfAppealName) {
            case AppealType.AddIndividualMeter:
                this.sendNotification(
                    dto,
                    'Было добавлено обращение по поводу замены счётчика'
                )
                break;
            case AppealType.VerifyIndividualMeter:
                this.sendNotification(
                    dto,
                    'Было добавлено обращение по поводу поверки счётчика'
                )
                break;
            case AppealType.Claim:
            case AppealType.ProblemOrQuestion:
                this.sendNotification(
                    dto,
                    'Было добавлено обращение'
                )
                break;
        }

        return { newAppeal };
    }

    private async sendNotification(dto: AppealAddAppeal.Request, message: string) {
        const managementCompanyId = await this.rmqService.send
            <ReferenceGetManagementCompany.Request, ReferenceGetManagementCompany.Response>
            (ReferenceGetManagementCompany.topic, { subscriberId: dto.subscriberId });

        await this.rmqService.notify(AddNotification.topic,
            {
                userId: managementCompanyId,
                userRole: UserRole.ManagementCompany,
                notificationType: NotificationType.SentAppeal,
                message: message,
                createdAt: new Date(),
            }
        );
    }
}