import { Injectable } from "@nestjs/common";
import { AddDocumentDetails, DeleteDocumentDetails } from "@myhome/contracts";
import { DocumentDetailRepository } from "./document-detail.repository";
import { DocumentDetailEntity } from "./document-detail.entity";

@Injectable()
export class DocumentDetailService {
    constructor(
        private readonly detailRepository: DocumentDetailRepository,
    ) { }

    public async addDocumentDetails(dto: AddDocumentDetails.Request): Promise<AddDocumentDetails.Response> {
        const documentDetails: DocumentDetailEntity[] = dto.details.map(detail => {
            const entity = new DocumentDetailEntity(detail);
            return entity;
        });
        const createdDetails = await this.detailRepository.createMany(documentDetails);
        const detailIds = createdDetails.map(detail => detail.id);
        return { detailIds: detailIds };
    }

    public async deleteDocumentDetails(dto: DeleteDocumentDetails.Request) {
        return await this.detailRepository.deleteMany(dto.detailIds);
    }
}
