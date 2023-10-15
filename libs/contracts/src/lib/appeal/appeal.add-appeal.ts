import { IAppeal } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace AppealAddAppeal {
    export const topic = 'appeal.add-appeal.command';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;

        @IsNumber()
        typeOfAppealId!: number;

        @IsNumber()
        subscriberId!: number;

        @IsString()
        createdAt!: string;

        data: unknown;
    }

    export class Response {
        appeal!: IAppeal;
    }
}

