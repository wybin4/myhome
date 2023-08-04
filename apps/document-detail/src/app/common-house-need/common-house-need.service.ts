import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { DocumentDetailRepository } from "../document-detail/document-detail.repository";
import { GetDocumentDetail, ReferenceGetAllTypesOfService, ReferenceGetHouse } from "@myhome/contracts";
import { HOME_NOT_EXIST, RMQException } from "@myhome/constants";
import { PublicUtilityService } from "../public-utility/public-utility.service";

@Injectable()
export class CommonHouseNeedService {
    constructor(
        private readonly documentDetailRepository: DocumentDetailRepository,
        private readonly rmqService: RMQService,
        private readonly publicUtilityService: PublicUtilityService
    ) { }

    public async getCommonHouseNeed({ subscriberIds, houseId }: GetDocumentDetail.Request) {
        const house = await this.getManagementCID(houseId);
        const managementCompanyId = house.house.managementCompanyId;

        const individualAmountConsumed = await this.getPUSum(subscriberIds, managementCompanyId);
        console.log(individualAmountConsumed)
    }

    private async getManagementCID(houseId: number) {
        try {
            return await this.rmqService.send<ReferenceGetHouse.Request, ReferenceGetHouse.Response>(
                ReferenceGetHouse.topic, { id: houseId }
            );
        } catch (e) {
            throw new RMQException(HOME_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
    }

    private async getAllTypesOfService() {
        try {
            return await this.rmqService.send<ReferenceGetAllTypesOfService.Request, ReferenceGetAllTypesOfService.Response>(
                ReferenceGetAllTypesOfService.topic, new ReferenceGetAllTypesOfService.Request()
            );
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getPUSum(subscriberIds: number[], managementCompanyId: number) {
        const publicUtilities = await this.publicUtilityService.getPublicUtility({ subscriberIds, managementCompanyId });
        const typesOfService = (await this.getAllTypesOfService()).typesOfService.map(obj => obj.id);
        const amountConsumed = [];
        for (const tos of typesOfService) {
            let temp: {
                tariff: number,
                amountConsumed: number,
                typeOfServiceId: number
            };
            let sum = 0;
            for (const pu of publicUtilities) {
                temp = pu.publicUtility.find((obj) => obj.typeOfServiceId === tos);
                if (temp) { sum += temp.amountConsumed; }
            }
            if (sum > 0) {
                amountConsumed.push({
                    count: sum,
                    typesOfServiceId: tos
                });
            }
        }
        return amountConsumed;
    }
}