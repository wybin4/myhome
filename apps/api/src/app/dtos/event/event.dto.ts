import { EventType, IMeta } from "@myhome/interfaces";

export class GetEventsDto {
    events!: EventType[];
    meta?: IMeta;
}