import { GetSinglePaymentDocument, ReferenceGetSubscriber } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { SinglePaymentDocumentRepository } from "./single-payment-document.repository";
import { SinglePaymentDocumentEntity } from "./single-payment-document.entity";
import { CalculationState } from "@myhome/interfaces";
import { RMQException, SUBSCRIBER_WITH_ID_NOT_EXIST } from "@myhome/constants";

@Injectable()
export class SinglePaymentDocumentService {
    constructor(
        private readonly rmqSerivce: RMQService,
        private readonly singlePaymentDocumentRepository: SinglePaymentDocumentRepository
    ) { }

    // public async buyCourse(userId: string, courseId: string) {
    //     const existedUser = await this.userRepository.findUserById(userId);
    //     if (!existedUser) {
    //         throw new Error('Такого пользователя нет');
    //     }
    //     const userEntity = new UserEntity(existedUser);
    //     const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
    //     const { user, paymentLink } = await saga.getState().pay();
    //     await this.updateUser(user);
    //     return { paymentLink };
    // }

    async getSinglePaymentDocument(dto: GetSinglePaymentDocument.Request) {
        const SPDs = []
        for (const subscriberId of dto.subscriberIds) {
            await this.checkSubscriber(subscriberId);
            const SPDEntity =
                new SinglePaymentDocumentEntity({
                    managementCompanyId: dto.managementCompanyId,
                    subscriberId: subscriberId,
                    createdAt: new Date(),
                    status: CalculationState.Started
                });
            const newSPD = await this.singlePaymentDocumentRepository.createSinglePaymentDocument(SPDEntity);
            SPDs.push(newSPD);
        }
        return { singlePaymentDocument: SPDs };
    }

    private async checkSubscriber(subscriberId: number) {
        try {
            await this.rmqSerivce.send
                <
                    ReferenceGetSubscriber.Request,
                    ReferenceGetSubscriber.Response
                >
                (ReferenceGetSubscriber.topic, { id: subscriberId });
        } catch (e) {
            throw new RMQException(SUBSCRIBER_WITH_ID_NOT_EXIST.message(subscriberId), SUBSCRIBER_WITH_ID_NOT_EXIST.status);
        }
    }
}