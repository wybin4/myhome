import { IsNumber, Validate } from 'class-validator';
import { IBaseTariffAndNorm, TariffAndNormType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';
import { MetaRequest, MetaResponse } from '../../meta.validator';

export namespace ReferenceGetTariffsOrNormsByUser {
    export const topic = 'reference.get-tariffs-and-norms-by-user.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @Validate(IsValidEnumValue, [TariffAndNormType])
        type!: TariffAndNormType;
    }

    export class Response extends MetaResponse {
        tariffAndNorms!: IGetTariffAndNorm[];
    }
}
export interface IGetTariffAndNorm extends IBaseTariffAndNorm {
    typeOfServiceName: string;
    unitName?: string;
    houseName?: string;
}