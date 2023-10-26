import { IAppeal } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace AppealAddAppeal {
    export const topic = 'appeal.add-appeal.command';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @IsNumber({}, { message: "Id типа обращения должен быть числом" })
        typeOfAppealId!: number;

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

