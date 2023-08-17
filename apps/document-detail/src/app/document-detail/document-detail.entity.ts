import { IDocumentDetail } from "@myhome/interfaces";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('document-details')
export class DocumentDetailEntity implements IDocumentDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    typeOfServiceId: number;

    @Column('double', { nullable: false })
    tariff: number;

    @Column('double', { nullable: false })
    amountConsumed: number;

    @Column({ nullable: false })
    singlePaymentDocumentId: number;

    constructor(data?: Partial<DocumentDetailEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public getDocumentDetail() {
        return {
            typeOfServiceId: this.typeOfServiceId,
            tariff: this.tariff,
            amountConsumed: this.amountConsumed,
            singlePaymentDocumentId: this.singlePaymentDocumentId,
        }
    }
}
