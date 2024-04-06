import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "./payment.repository";
import { AcceptPayment, CheckSinglePaymentDocument, CorrectionUpdateDebt, GetPaymentsBySpd, GetPaymentsByUser, GetSinglePaymentDocumentsByUser } from "@myhome/contracts";
import { UserRole } from "@myhome/interfaces";
import { CANT_GET_SPD, CANT_GET_SPDS, RMQException } from "@myhome/constants";
import { RMQService } from "nestjs-rmq";
import { PaymentEntity } from "./payment.entity";

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly rmqService: RMQService
    ) { }

    public async acceptPayment(dto: AcceptPayment.Request): Promise<AcceptPayment.Response> {
        await this.updateDebt(dto.singlePaymentDocumentId, dto.amount);
        const payment = new PaymentEntity({
            singlePaymentDocumentId: dto.singlePaymentDocumentId,
            amount: dto.amount,
            payedAt: new Date()
        });
        const paymentEntity = await this.paymentRepository.create(payment);
        return { payment: paymentEntity };
    }

    private async updateDebt(singlePaymentDocumentId: number, amount: number) {
        try {
            return await this.rmqService.send<
                CorrectionUpdateDebt.Request,
                CorrectionUpdateDebt.Response
            >(CorrectionUpdateDebt.topic, { singlePaymentDocumentId, amount });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    public async getPaymentsByUser(dto: GetPaymentsByUser.Request): Promise<GetPaymentsByUser.Response> {
        const { singlePaymentDocuments } = await this.getSPDsByUser(dto.userId, dto.userRole);
        if (!singlePaymentDocuments.length) {
            throw new RMQException(CANT_GET_SPDS.message, CANT_GET_SPDS.status);
        }
        const spdIds = singlePaymentDocuments.map(spd => spd.id);
        const payments = await this.paymentRepository.findBySPDIds(spdIds);
        return { payments };
    }

    public async getPaymentsBySpdId(dto: GetPaymentsBySpd.Request): Promise<GetPaymentsBySpd.Response> {
        const { singlePaymentDocument } = await this.checkSpd(dto.singlePaymentDocumentId);
        if (!singlePaymentDocument) {
            throw new RMQException(CANT_GET_SPD.message(dto.singlePaymentDocumentId), CANT_GET_SPD.status);
        }
        const payments = await this.paymentRepository.findBySPDIds([dto.singlePaymentDocumentId]);
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

    private async checkSpd(id: number) {
        try {
            return await this.rmqService.send<
                CheckSinglePaymentDocument.Request,
                CheckSinglePaymentDocument.Response
            >(CheckSinglePaymentDocument.topic, { id });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }
}