import { AppealStatus, IAppeal } from '@myhome/interfaces';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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

        @IsOptional()
        @IsString()
        status?: AppealStatus;

        data: unknown;
    }

    export class Response {
        appeal!: IAppeal;
    }
}

