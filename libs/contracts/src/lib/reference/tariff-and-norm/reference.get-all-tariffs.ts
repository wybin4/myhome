import { IsString } from 'class-validator';
import { ICommonHouseNeedTariff, IMunicipalTariff, RequireHomeOrManagementCompany, TariffAndNormType } from '@myhome/interfaces';

export namespace ReferenceGetAllTariffs {
    export const topic = 'reference.get-all-tariffs.query';

    export class Request {
        @RequireHomeOrManagementCompany()
        managementCompanyId?: number;

        @RequireHomeOrManagementCompany()
        houseId?: number;

        @IsString()
        type!: TariffAndNormType.MunicipalTariff | TariffAndNormType.CommonHouseNeedTariff;
    }

    export class Response {
        tariffs!: IMunicipalTariff[] | ICommonHouseNeedTariff[];
    }
}
