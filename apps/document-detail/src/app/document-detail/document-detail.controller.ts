import { DocumentDetailService } from './document-detail.service';
import { AddDocumentDetails, DeleteDocumentDetails } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class DocumentDetailController {
    constructor(
        private readonly documentDetailService: DocumentDetailService,
    ) { }

    @RMQValidate()
    @RMQRoute(AddDocumentDetails.topic)
    async addDocumentDetails(@Body() dto: AddDocumentDetails.Request) {
        try {
            return await this.documentDetailService.addDocumentDetails(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(DeleteDocumentDetails.topic)
    async deleteDocumentDetails(@Body() dto: DeleteDocumentDetails.Request) {
        try {
            return await this.documentDetailService.deleteDocumentDetails(dto);
        }
        catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
