import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "./payment.repository";
import { GetPaymentsByUser, GetSinglePaymentDocumentsByUser } from "@myhome/contracts";
import { UserRole } from "@myhome/interfaces";
import { CANT_GET_SPDS, RMQException } from "@myhome/constants";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly rmqService: RMQService
    ) { }

    public async getPaymentsByUser(dto: GetPaymentsByUser.Request): Promise<GetPaymentsByUser.Response> {
        const { singlePaymentDocuments } = await this.getSPDsByUser(dto.userId, dto.userRole);
        if (!singlePaymentDocuments.length) {
            throw new RMQException(CANT_GET_SPDS.message, CANT_GET_SPDS.status);
        }
        const spdIds = singlePaymentDocuments.map(spd => spd.id);
        const payments = await this.paymentRepository.findBySPDIds(spdIds);
        return { payments };
    }

    private async getSPDsByUser(userId: number, userRole: UserRole) {
        try {
            return await this.rmqService.send<
                GetSinglePaymentDocumentsByUser.Request,
                GetSinglePaymentDocumentsByUser.Response
            >(GetSinglePaymentDocumentsByUser.topic, { userId, userRole });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }
}