import { EventTypeRequest, IGetEvents, UserRole } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from "../enum.validator";
import { MetaRequest } from "../meta.validator";

export namespace EventGetEvents {
    export const topic = 'event.get-events.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @Validate(IsValidEnumValue, [EventTypeRequest])
        eventType!: EventTypeRequest;
    }

    export class Response {
        events!: IGetEvents;
    }
}