import { IsString } from 'class-validator';
import { ICommonHouseNeedTariff, IMunicipalTariff, RequireHomeOrManagementCompany, TariffAndNormType } from '@myhome/interfaces';

export namespace ReferenceGetAllTariffs {
    export const topic = 'reference.get-all-tariffss.query';

    export class Request {
        @RequireHomeOrManagementCompany()
        managementCompanyId?: number;

        @RequireHomeOrManagementCompany()
        houseId?: number;

        @IsString()
        type!: TariffAndNormType.MunicipalTariff | TariffAndNormType.CommonHouseNeedTariff;
    }

    export class Response {
        tariff!: IMunicipalTariff | ICommonHouseNeedTariff;
    }
}
