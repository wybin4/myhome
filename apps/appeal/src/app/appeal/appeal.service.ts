import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { AppealRepository, TypeOfAppealRepository } from "./repositories/appeal.repository";
import { APPEAL_NOT_EXIST, MANAG_COMP_NOT_EXIST, SUBSCRIBER_NOT_EXIST, TYPE_OF_APPEAL_NOT_EXIST } from "@myhome/constants";
import { AccountUserInfo, AppealAddAppeal, ReferenceGetSubscriber } from "@myhome/contracts";
import { AppealEntity } from "./entities/appeal.entity";
import { UserRole } from "@myhome/interfaces";


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
        try {
            await this.rmqService.send
                <AccountUserInfo.Request, AccountUserInfo.Response>
                (AccountUserInfo.topic, { id: dto.managementCompanyId, role: UserRole.ManagementCompany });
        } catch (e) {
            throw new RMQError(MANAG_COMP_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        try {
            await this.rmqService.send
                <ReferenceGetSubscriber.Request, ReferenceGetSubscriber.Response>
                (ReferenceGetSubscriber.topic, { id: dto.subscriberId });
        } catch (e) {
            throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const newAppealEntity = new AppealEntity({
            managementCompanyId: dto.managementCompanyId,
            typeOfAppealId: dto.typeOfAppealId,
            subscriberId: dto.subscriberId,
            createdAt: new Date(dto.createdAt),
            status: dto.status,
            data: String(dto.data),
        });
        const newAppeal = await this.appealRepository.createAppeal(newAppealEntity);
        return { newAppeal };
    }
}