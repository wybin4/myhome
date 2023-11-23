import { ReferenceGetAllTariffs } from "@myhome/contracts";
import { TariffAndNormType } from "@myhome/interfaces";
import { HttpStatus } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { TARIFFS_NOT_EXIST } from "../../errors/tariff-and-norm.errors";
import { RMQException } from "../../exception";

export async function getAllTariffs(rmqService: RMQService, managementCompanyId: number, type: TariffAndNormType.MunicipalTariff | TariffAndNormType.CommonHouseNeedTariff) {
    try {
        return await rmqService.send
            <
                ReferenceGetAllTariffs.Request,
                ReferenceGetAllTariffs.Response
            >
            (
                ReferenceGetAllTariffs.topic,
                { managementCompanyId, type }
            );
    } catch (e) {
        throw new RMQException(TARIFFS_NOT_EXIST, HttpStatus.NOT_FOUND);
    }
}