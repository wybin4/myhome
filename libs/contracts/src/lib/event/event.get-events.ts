import { EventType, IGetEvents, UserRole } from "@myhome/interfaces";
import { IsArray, IsNumber, Validate } from "class-validator";
import { IsValidEnumArray, IsValidEnumValue } from "../enum.validator";
import { MetaRequest } from "../meta.validator";

export namespace EventGetEvents {
    export const topic = 'event.get-events.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsArray({ message: "Тип событий должен быть массивом" })
        @Validate(IsValidEnumArray, [EventType])
        events!: EventType[];
    }

    export class Response {
        events!: IGetEvents;
    }
}