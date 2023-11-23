import { AppealStatus, IAppeal } from '@myhome/interfaces';
import { IsNumber, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace EventUpdateAppeal {
    export const topic = 'event.update-appeal.command';

    export class Request {
        @IsNumber({}, { message: "Id обращения должен быть числом" })
        id!: number;

        @Validate(IsValidEnumValue, [AppealStatus])
        status!: AppealStatus;
    }

    export class Response {
        appeal!: IAppeal;
    }
}