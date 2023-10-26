import { AppealType, IAppeal } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace AppealAddAppeal {
    export const topic = 'appeal.add-appeal.command';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @Validate(IsValidEnumValue, [AppealType])
        typeOfAppeal!: AppealType;

        @IsNumber({}, { message: "Id абонента должен быть числом" })
        subscriberId!: number;

        @IsString()
        createdAt!: string;

        data: unknown;
    }

    export class Response {
        appeal!: IAppeal;
    }
}

